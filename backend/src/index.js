require('dotenv').config()
// Express 4 ne transmet pas les rejets des handlers async au middleware d'erreur :
// sans ce patch, toute erreur DB dans une route async ferait crasher le process.
require('express-async-errors')
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
app.use('/api/personnalites', require('./routes/personnalites'))
app.use('/api/selections',    require('./routes/selections'))
app.use('/api/regles',        require('./routes/regles'))
app.use('/api/person-edits',  require('./routes/personEdits'))
app.use('/api/export',        require('./routes/export'))
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

  // ── Table unique "personnalite" ─────────────────────────────────────────────
  // Fusion des anciennes tables alivePerson (vivants) et deathPerson (décès) :
  // date_deces NULL = personne vivante, renseignée = décédée (la date fait foi).
  // Les FK existantes (playerSelection, alivePersonEdit) suivent le RENAME.
  await db.query(`
    DO $$ BEGIN
      IF to_regclass('"personnalite"') IS NULL AND to_regclass('"alivePerson"') IS NOT NULL THEN
        ALTER TABLE "alivePerson" RENAME TO "personnalite";
      END IF;
    END $$
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS "personnalite" (
      id             SERIAL PRIMARY KEY,
      nom            VARCHAR(150),
      prenom         VARCHAR(150),
      categorie      VARCHAR(150),
      nationalite    VARCHAR(100),
      a_verifier     TEXT,
      date_naissance DATE,
      date_deces     DATE,
      statut         VARCHAR(20) DEFAULT 'validee',
      created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  // Colonnes manquantes sur les bases issues du RENAME.
  await db.query(`ALTER TABLE "personnalite" ADD COLUMN IF NOT EXISTS date_naissance DATE`)
  await db.query(`ALTER TABLE "personnalite" DROP COLUMN IF EXISTS annee_naissance`)
  await db.query(`ALTER TABLE "personnalite" ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'validee'`)
  await db.query(`
    ALTER TABLE "personnalite" ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)
  await db.query(`ALTER TABLE "personnalite" ADD COLUMN IF NOT EXISTS date_deces DATE`)
  // Signalement de décès en attente de validation admin : porté par la ligne
  // elle-même (plus besoin d'une seconde table), appliqué dans date_deces à la
  // validation puis remis à NULL.
  await db.query(`ALTER TABLE "personnalite" ADD COLUMN IF NOT EXISTS date_deces_proposee DATE`)
  await db.query(`
    ALTER TABLE "personnalite" ADD COLUMN IF NOT EXISTS deces_signale_par INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)

  // Import de l'ancienne table deathPerson puis suppression (idempotent : ne
  // s'exécute que si elle existe encore).
  await db.query(`
    DO $$ BEGIN
      IF to_regclass('"deathPerson"') IS NOT NULL THEN
        -- Colonnes ajoutées après la création initiale de deathPerson sur les
        -- bases anciennes (ex. Render/Neon jamais passées par ces étapes) :
        -- requises par les requêtes de fusion ci-dessous.
        ALTER TABLE "deathPerson" ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'validee';
        ALTER TABLE "deathPerson" ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
        ALTER TABLE "deathPerson" ADD COLUMN IF NOT EXISTS alive_person_id INTEGER REFERENCES "personnalite"(id) ON DELETE SET NULL;

        -- Décès validés liés à une personne existante (signalements aboutis)
        UPDATE "personnalite" p SET date_deces = dp.date_deces
        FROM "deathPerson" dp
        WHERE dp.alive_person_id = p.id AND dp.statut = 'validee' AND p.date_deces IS NULL;

        -- Signalements encore en attente : reportés sur la ligne de la personne
        UPDATE "personnalite" p SET date_deces_proposee = dp.date_deces, deces_signale_par = dp.created_by
        FROM "deathPerson" dp
        WHERE dp.alive_person_id = p.id AND dp.statut = 'en_attente' AND p.date_deces IS NULL;

        -- Lignes marquées 'decedee' dont le lien a été perdu : rattrapage par nom
        UPDATE "personnalite" p SET date_deces = dp.date_deces
        FROM "deathPerson" dp
        WHERE p.statut = 'decedee' AND p.date_deces IS NULL AND dp.statut = 'validee'
          AND lower(p.nom) = lower(dp.nom)
          AND lower(COALESCE(p.prenom, '')) = lower(COALESCE(dp.prenom, ''));

        -- Tout le reste (décès sans ligne vivante correspondante) : nouvelles lignes
        INSERT INTO "personnalite" (nom, prenom, categorie, nationalite, date_naissance, date_deces, a_verifier, statut, created_by)
        SELECT dp.nom, dp.prenom, dp.categorie, dp.nationalite, dp.date_naissance, dp.date_deces, dp.a_verifier, dp.statut, dp.created_by
        FROM "deathPerson" dp
        WHERE dp.alive_person_id IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM "personnalite" p
            WHERE lower(p.nom) = lower(dp.nom)
              AND lower(COALESCE(p.prenom, '')) = lower(COALESCE(dp.prenom, ''))
          );

        DROP TABLE "deathPerson";
      END IF;
    END $$
  `)

  // Le statut 'decedee' n'existe plus : c'est date_deces qui fait foi.
  await db.query(`UPDATE "personnalite" SET statut = 'validee' WHERE statut = 'decedee'`)
  await db.query(`ALTER TABLE "personnalite" DROP CONSTRAINT IF EXISTS aliveperson_statut_check`)
  await db.query(`ALTER TABLE "personnalite" DROP CONSTRAINT IF EXISTS personnalite_statut_check`)
  await db.query(`
    ALTER TABLE "personnalite" ADD CONSTRAINT personnalite_statut_check CHECK (statut IN ('en_attente', 'validee'))
  `)

  // File d'attente des modifications proposées par un joueur sur une personnalité
  // déjà validée : les nouvelles valeurs ne sont appliquées qu'à la validation
  // admin, puis la ligne est supprimée (pas d'historique à conserver).
  await db.query(`
    DO $$ BEGIN
      IF to_regclass('"personEdit"') IS NULL AND to_regclass('"alivePersonEdit"') IS NOT NULL THEN
        ALTER TABLE "alivePersonEdit" RENAME TO "personEdit";
        ALTER TABLE "personEdit" RENAME COLUMN alive_person_id TO person_id;
      END IF;
    END $$
  `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS "personEdit" (
      id             SERIAL PRIMARY KEY,
      person_id      INTEGER NOT NULL REFERENCES "personnalite"(id) ON DELETE CASCADE,
      nom            VARCHAR(150) NOT NULL,
      prenom         VARCHAR(150) NOT NULL,
      categorie      VARCHAR(150),
      nationalite    VARCHAR(100),
      date_naissance DATE,
      created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS "playerSelection" (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      person_id  INTEGER NOT NULL REFERENCES "personnalite"(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, person_id)
    )
  `)
  await db.query(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'playerSelection' AND column_name = 'alive_person_id'
      ) THEN
        ALTER TABLE "playerSelection" RENAME COLUMN alive_person_id TO person_id;
      END IF;
    END $$
  `)
  // Renseigné (100 - âge au décès, min 10) quand la personne sélectionnée décède et que
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

  // Index d'expression sur lower(nom/prenom) : utilisé par toutes les
  // vérifications de doublons (comparaisons insensibles à la casse).
  await db.query(`DROP INDEX IF EXISTS aliveperson_nom_prenom_idx`)
  await db.query(`CREATE INDEX IF NOT EXISTS personnalite_nom_prenom_idx ON "personnalite" (lower(nom), lower(prenom))`)
  await db.query(`DROP INDEX IF EXISTS playerselection_alive_idx`)
  await db.query(`CREATE INDEX IF NOT EXISTS playerselection_person_idx ON "playerSelection" (person_id)`)
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
      description: "Attribue (100 - âge au décès, minimum 10) points à chaque joueur ayant sélectionné la personne, lors de la validation du décès.",
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
    {
      code: 'bonus_meme_jour',
      nom: 'Bonus décès le même jour',
      description: "Si 2 personnalités (ou plus) de la liste d'un joueur meurent le même jour, leurs points sont additionnés puis majorés du pourcentage ci-contre (arrondi à l'entier supérieur).",
      valeur: 50,
    },
    {
      code: 'bonus_unique',
      nom: 'Bonus sélection unique',
      description: "Si une personnalité n'a été sélectionnée que par un seul joueur (et aucun autre) au moment de son décès, ce joueur reçoit le nombre de points bonus ci-contre, en plus des points normaux.",
      valeur: 10,
    },
    {
      code: 'selections_gelees',
      nom: 'Geler les sélections des joueurs',
      description: "Quand cette option est activée, aucun joueur ne peut plus ajouter ou retirer une personnalité de sa liste (l'administration reste toujours possible).",
      valeur: null,
      active: false,
    },
  ]
  for (const r of defaults) {
    await db.query(
      `INSERT INTO "regles" (code, nom, description, active, valeur) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description`,
      [r.code, r.nom, r.description, r.active ?? true, r.valeur]
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

// Seed depuis les CSV scrapés, avec un garde-fou par population (vivants /
// décédés) : une base migrée a déjà les deux, une base fraîche importe tout.
async function seedPersonnalites() {
  const { rows: deadRows } = await db.query('SELECT COUNT(*)::int AS count FROM "personnalite" WHERE date_deces IS NOT NULL')
  if (deadRows[0].count === 0) {
    const records = parseCsv(fs.readFileSync(path.join(__dirname, 'data', 'deathPerson.csv'), 'utf8'))
    for (const r of records) {
      await db.query(
        `INSERT INTO "personnalite" (nom, prenom, categorie, date_naissance, date_deces, nationalite, a_verifier)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [r.nom || null, r.prenom || null, r.categorie || null, r.date_naissance || null, r.date_deces || null, r.nationalite || null, r.a_verifier || null]
      )
    }
    console.log(`${records.length} personnalités décédées importées`)
  }

  const { rows: aliveRows } = await db.query('SELECT COUNT(*)::int AS count FROM "personnalite" WHERE date_deces IS NULL')
  if (aliveRows[0].count === 0) {
    const records = parseCsv(fs.readFileSync(path.join(__dirname, 'data', 'alivePerson.csv'), 'utf8'))
    for (const r of records) {
      await db.query(
        `INSERT INTO "personnalite" (nom, prenom, categorie, date_naissance, nationalite, a_verifier)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.nom || null, r.prenom || null, r.categorie || null, r.date_naissance || null, r.nationalite || null, r.a_verifier || null]
      )
    }
    console.log(`${records.length} personnalités vivantes importées`)
  }
}

const PORT = process.env.PORT || 3001

;(async () => {
  try {
    await waitForDB()
    await initDB()
    await seed()
    await seedRegles()
    await seedPersonnalites()
    app.listen(PORT, () => console.log(`Backend démarré sur http://localhost:${PORT}`))
  } catch (err) {
    console.error('Erreur au démarrage :', err.message)
    process.exit(1)
  }
})()
