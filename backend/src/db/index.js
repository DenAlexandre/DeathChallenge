const { Pool } = require('pg')
const types = require('pg').types
require('dotenv').config()

// Les colonnes DATE n'ont pas de fuseau horaire ; sans ceci, pg les convertit
// en objet Date puis en ISO UTC au sérialisation JSON, décalant la date d'un
// jour selon le fuseau du serveur. On les garde en chaîne "YYYY-MM-DD" brute.
types.setTypeParser(1082, val => val)

// Les fournisseurs hébergés (Neon, Render Postgres...) exigent une connexion
// SSL ; le Postgres local (Docker) n'en a pas besoin. On active SSL dès que
// l'hôte n'est pas local, sans avoir besoin d'une variable d'environnement
// supplémentaire à gérer entre dev et prod.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}
