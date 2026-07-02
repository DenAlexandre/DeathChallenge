const db = require('./db')

// Les règles sont lues à chaque requête de jeu (sélection, proposition,
// signalement...) mais ne changent que via l'écran admin : un petit cache
// avec TTL évite une requête DB par appel. L'écran admin invalide le cache
// à chaque modification, le TTL ne sert que de filet de sécurité (ex. si
// plusieurs instances du backend tournaient).
const TTL_MS = 30_000
const cache = new Map() // code -> { value, at }

async function getRegle(code) {
  const hit = cache.get(code)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value

  const { rows } = await db.query('SELECT * FROM "regles" WHERE code = $1', [code])
  const value = rows[0] || null
  cache.set(code, { value, at: Date.now() })
  return value
}

function invalidateRegles() {
  cache.clear()
}

module.exports = { getRegle, invalidateRegles }
