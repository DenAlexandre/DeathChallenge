require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const db = require('./db')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',    require('./routes/auth'))
app.use('/api/persons', require('./routes/persons'))
app.use('/api/users',   require('./routes/users'))
app.get('/api/health',  (req, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Erreur interne' })
})

async function waitForDB(retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      await db.query('SELECT 1')
      return
    } catch {
      console.log(`Base de données indisponible, tentative ${i + 1}/${retries}...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  throw new Error('Impossible de se connecter à la base de données')
}

async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      VARCHAR(50)  UNIQUE NOT NULL,
      email         VARCHAR(100),
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(20)  NOT NULL DEFAULT 'viewer'
                    CHECK (role IN ('admin', 'editor', 'viewer')),
      created_at    TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS persons (
      id             SERIAL PRIMARY KEY,
      nom            VARCHAR(100) NOT NULL,
      prenom         VARCHAR(100) NOT NULL,
      date_naissance DATE,
      nationalite    VARCHAR(100),
      categorie      VARCHAR(100),
      description    TEXT,
      is_alive       BOOLEAN      NOT NULL DEFAULT true,
      deceased_at    DATE,
      created_at     TIMESTAMPTZ  DEFAULT NOW(),
      updated_at     TIMESTAMPTZ  DEFAULT NOW(),
      created_by     INTEGER      REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  await db.query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql
  `)

  await db.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'persons_updated_at') THEN
        CREATE TRIGGER persons_updated_at
          BEFORE UPDATE ON persons
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      END IF;
    END $$
  `)
}

async function seed() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM users')
  if (rows[0].count > 0) return

  const defaults = [
    { username: 'admin',  email: 'admin@local',  password: 'admin123',  role: 'admin'  },
    { username: 'editor', email: 'editor@local', password: 'editor123', role: 'editor' },
    { username: 'viewer', email: 'viewer@local', password: 'viewer123', role: 'viewer' },
  ]
  for (const u of defaults) {
    const hash = await bcrypt.hash(u.password, 10)
    await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [u.username, u.email, hash, u.role]
    )
  }
  console.log('Comptes par défaut créés : admin/admin123  editor/editor123  viewer/viewer123')
}

const PORT = process.env.PORT || 3001

;(async () => {
  try {
    await waitForDB()
    await initDB()
    await seed()
    app.listen(PORT, () => console.log(`Backend démarré sur http://localhost:${PORT}`))
  } catch (err) {
    console.error('Erreur au démarrage :', err.message)
    process.exit(1)
  }
})()
