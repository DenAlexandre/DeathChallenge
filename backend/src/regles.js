const db = require('./db')

async function getRegle(code) {
  const { rows } = await db.query('SELECT * FROM "regles" WHERE code = $1', [code])
  return rows[0] || null
}

module.exports = { getRegle }
