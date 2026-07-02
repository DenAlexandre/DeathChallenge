const { Pool } = require('pg')
const types = require('pg').types
require('dotenv').config()

// Les colonnes DATE n'ont pas de fuseau horaire ; sans ceci, pg les convertit
// en objet Date puis en ISO UTC au sérialisation JSON, décalant la date d'un
// jour selon le fuseau du serveur. On les garde en chaîne "YYYY-MM-DD" brute.
types.setTypeParser(1082, val => val)

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}
