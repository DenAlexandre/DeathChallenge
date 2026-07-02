require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const db = require('./db')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',    require('./routes/auth'))
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
    CREATE TABLE IF NOT EXISTS "deathPerson" (
      id             SERIAL PRIMARY KEY,
      nom            VARCHAR(150),
      prenom         VARCHAR(150),
      categorie      VARCHAR(150),
      date_naissance DATE,
      date_deces     DATE,
      nationalite    VARCHAR(100),
      a_verifier     TEXT
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS "alivePerson" (
      id              SERIAL PRIMARY KEY,
      nom             VARCHAR(150),
      prenom          VARCHAR(150),
      categorie       VARCHAR(150),
      annee_naissance INTEGER,
      nationalite     VARCHAR(100),
      a_verifier      TEXT
    )
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

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = false
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(l => l.length > 0)
  const header = parseCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    const record = {}
    header.forEach((key, i) => { record[key] = values[i] ?? '' })
    return record
  })
}

async function seedDeathPersons() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM "deathPerson"')
  if (rows[0].count > 0) return

  const csvPath = path.join(__dirname, 'data', 'deathPerson.csv')
  const records = parseCsv(fs.readFileSync(csvPath, 'utf8'))

  for (const r of records) {
    await db.query(
      `INSERT INTO "deathPerson" (nom, prenom, categorie, date_naissance, date_deces, nationalite, a_verifier)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        r.nom || null,
        r.prenom || null,
        r.categorie || null,
        r.date_naissance || null,
        r.date_deces || null,
        r.nationalite || null,
        r.a_verifier || null,
      ]
    )
  }
  console.log(`${records.length} personnalités décédées importées dans deathPerson`)
}

async function seedAlivePersons() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM "alivePerson"')
  if (rows[0].count > 0) return

  const csvPath = path.join(__dirname, 'data', 'alivePerson.csv')
  const records = parseCsv(fs.readFileSync(csvPath, 'utf8'))

  for (const r of records) {
    await db.query(
      `INSERT INTO "alivePerson" (nom, prenom, categorie, annee_naissance, nationalite, a_verifier)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        r.nom || null,
        r.prenom || null,
        r.categorie || null,
        r.annee_naissance || null,
        r.nationalite || null,
        r.a_verifier || null,
      ]
    )
  }
  console.log(`${records.length} personnalités vivantes importées dans alivePerson`)
}

const PORT = process.env.PORT || 3001

;(async () => {
  try {
    await waitForDB()
    await initDB()
    await seed()
    await seedDeathPersons()
    await seedAlivePersons()
    app.listen(PORT, () => console.log(`Backend démarré sur http://localhost:${PORT}`))
  } catch (err) {
    console.error('Erreur au démarrage :', err.message)
    process.exit(1)
  }
})()
