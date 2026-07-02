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

app.use('/api/auth',          require('./routes/auth'))
app.use('/api/users',         require('./routes/users'))
app.use('/api/alive-persons', require('./routes/alivePersons'))
app.use('/api/death-persons', require('./routes/deathPersons'))
app.use('/api/selections',    require('./routes/selections'))
app.use('/api/regles',        require('./routes/regles'))
app.use('/api/person-edits',  require('./routes/personEdits'))
app.get('/api/health',        (req, res) => res.json({ status: 'ok' }))

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
      role          VARCHAR(20)  NOT NULL DEFAULT 'joueur'
                    CHECK (role IN ('admin', 'joueur')),
      created_at    TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  // Migration pour les bases existantes créées avec l'ancien modèle à 3 rôles.
  // Le DROP doit précéder l'UPDATE : tant que l'ancienne contrainte (admin/editor/viewer)
  // est active, une ligne passée à 'joueur' la violerait.
  await db.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'joueur'`)
  await db.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`)
  await db.query(`UPDATE users SET role = 'joueur' WHERE role IN ('editor', 'viewer')`)
  await db.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'joueur'))`)

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

  // Comme pour alivePerson : les joueurs peuvent signaler un décès absent de la
  // base scrapée. La ligne reste "en_attente" (non prise en compte comme décès
  // avéré) tant qu'un admin ne l'a pas validée.
  await db.query(`ALTER TABLE "deathPerson" ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'validee'`)
  await db.query(`
    ALTER TABLE "deathPerson" ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)
  await db.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deathperson_statut_check') THEN
        ALTER TABLE "deathPerson"
          ADD CONSTRAINT deathperson_statut_check CHECK (statut IN ('en_attente', 'validee'));
      END IF;
    END $$
  `)
  // Renseigné quand l'entrée provient du signalement d'une personne déjà présente
  // dans alivePerson (plutôt que d'une proposition de personnalité inédite) : permet,
  // à la validation, de retrouver la ligne alivePerson à supprimer ou marquer décédée.
  await db.query(`
    ALTER TABLE "deathPerson" ADD COLUMN IF NOT EXISTS alive_person_id INTEGER REFERENCES "alivePerson"(id) ON DELETE SET NULL
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS "alivePerson" (
      id              SERIAL PRIMARY KEY,
      nom             VARCHAR(150),
      prenom          VARCHAR(150),
      categorie       VARCHAR(150),
      nationalite     VARCHAR(100),
      a_verifier      TEXT
    )
  `)

  await db.query(`ALTER TABLE "alivePerson" ADD COLUMN IF NOT EXISTS date_naissance DATE`)
  // Ancien repli utilisé quand la date exacte de naissance n'était pas connue
  // (données scrapées) — retiré, date_naissance est désormais la seule source.
  await db.query(`ALTER TABLE "alivePerson" DROP COLUMN IF EXISTS annee_naissance`)
  await db.query(`ALTER TABLE "alivePerson" ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'validee'`)
  await db.query(`
    ALTER TABLE "alivePerson" ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)
  // 'decedee' : la personne a été signalée décédée et validée, mais au moins un joueur
  // l'avait dans sa sélection — on la conserve (au lieu de la supprimer) pour ne pas
  // perdre l'historique de son pari. DROP puis ADD (comme pour users.role) pour que les
  // bases déjà migrées avec l'ancienne contrainte (sans 'decedee') soient mises à jour.
  await db.query(`ALTER TABLE "alivePerson" DROP CONSTRAINT IF EXISTS aliveperson_statut_check`)
  await db.query(`
    ALTER TABLE "alivePerson" ADD CONSTRAINT aliveperson_statut_check CHECK (statut IN ('en_attente', 'validee', 'decedee'))
  `)

  // File d'attente des modifications proposées par un joueur sur une personnalité
  // déjà validée : les nouvelles valeurs ne sont appliquées à alivePerson qu'à la
  // validation admin. La ligne est supprimée une fois traitée (validée ou rejetée) —
  // elle ne sert qu'à porter la proposition, pas d'historique à conserver.
  await db.query(`
    CREATE TABLE IF NOT EXISTS "alivePersonEdit" (
      id              SERIAL PRIMARY KEY,
      alive_person_id INTEGER NOT NULL REFERENCES "alivePerson"(id) ON DELETE CASCADE,
      nom             VARCHAR(150) NOT NULL,
      prenom          VARCHAR(150) NOT NULL,
      categorie       VARCHAR(150),
      nationalite     VARCHAR(100),
      date_naissance  DATE,
      created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS "playerSelection" (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      alive_person_id INTEGER NOT NULL REFERENCES "alivePerson"(id) ON DELETE CASCADE,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, alive_person_id)
    )
  `)
  // Renseigné (100 - âge au décès, min 0) quand la personne sélectionnée décède et que
  // le décès est validé par un admin ; reste NULL tant qu'elle est vivante.
  await db.query(`ALTER TABLE "playerSelection" ADD COLUMN IF NOT EXISTS points INTEGER`)

  // Règles du jeu paramétrables : chaque ligne peut être activée/désactivée par un admin
  // (et, pour certaines, avoir sa valeur ajustée) sans toucher au code.
  await db.query(`
    CREATE TABLE IF NOT EXISTS "regles" (
      id          SERIAL PRIMARY KEY,
      code        VARCHAR(50) UNIQUE NOT NULL,
      nom         VARCHAR(150) NOT NULL,
      description TEXT,
      active      BOOLEAN NOT NULL DEFAULT true,
      valeur      INTEGER
    )
  `)
}

async function seed() {
  // Insertion idempotente par compte (ON CONFLICT DO NOTHING) plutôt qu'un
  // garde-fou global sur "la table users est vide" : sur une base ancienne
  // qui a déjà un compte mais pas l'autre (migration, interruption...), un
  // garde-fou global sauterait la création du compte manquant indéfiniment.
  const defaults = [
    { username: 'admin',  email: 'admin@local',  password: 'admin123',  role: 'admin'  },
    { username: 'joueur', email: 'joueur@local', password: 'joueur123', role: 'joueur' },
  ]
  for (const u of defaults) {
    const hash = await bcrypt.hash(u.password, 10)
    await db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, u.email, hash, u.role]
    )
  }
}

async function seedRegles() {
  const defaults = [
    {
      code: 'points_calcul',
      nom: 'Calcul des points au décès',
      description: "Attribue (100 - âge au décès, minimum 0) points à chaque joueur ayant sélectionné la personne, lors de la validation du décès.",
      valeur: null,
    },
    {
      code: 'validation_admin',
      nom: 'Validation administrateur obligatoire',
      description: "Les personnalités proposées et les décès signalés par les joueurs doivent être validés par un administrateur avant d'être pris en compte.",
      valeur: null,
    },
    {
      code: 'limite_selection',
      nom: 'Limite de sélection',
      description: "Nombre maximum de personnalités qu'un joueur peut sélectionner simultanément.",
      valeur: 10,
    },
  ]
  for (const r of defaults) {
    await db.query(
      `INSERT INTO "regles" (code, nom, description, valeur) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING`,
      [r.code, r.nom, r.description, r.valeur]
    )
  }
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
      `INSERT INTO "alivePerson" (nom, prenom, categorie, date_naissance, nationalite, a_verifier)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        r.nom || null,
        r.prenom || null,
        r.categorie || null,
        r.date_naissance || null,
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
    await seedRegles()
    await seedDeathPersons()
    await seedAlivePersons()
    app.listen(PORT, () => console.log(`Backend démarré sur http://localhost:${PORT}`))
  } catch (err) {
    console.error('Erreur au démarrage :', err.message)
    process.exit(1)
  }
})()
