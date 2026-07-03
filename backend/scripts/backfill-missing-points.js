// Rattrape les points manquants pour les personnalités déjà décédées dont les
// sélections n'ont jamais reçu de points (date_deces fixée hors du flux normal
// de l'app, ex. import initial, donc sans passer par applyDeath()).
// Dry-run par défaut, --apply pour écrire.

const { Pool } = require('pg')
const { calculateAge } = require('../src/services/deathService')

const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
  || 'postgresql://dc_user:dc_password@localhost:5432/deathchallenge'

const APPLY = process.argv.includes('--apply')
const MIN_POINTS = 10

function sslFor(url) {
  return /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false }
}

const db = new Pool({ connectionString: DATABASE_URL, ssl: sslFor(DATABASE_URL) })

;(async () => {
  try {
    console.log(APPLY ? 'Mode APPLY : écriture réelle.' : 'Mode DRY-RUN : aucune écriture (relancer avec --apply pour appliquer).')

    const { rows: people } = await db.query(`
      SELECT p.id, p.nom, p.prenom, p.date_naissance, p.date_deces,
             COUNT(ps.id) FILTER (WHERE ps.points IS NULL)::int AS null_points
      FROM "personnalite" p
      JOIN "playerSelection" ps ON ps.person_id = p.id
      WHERE p.date_deces IS NOT NULL
      GROUP BY p.id
      HAVING COUNT(ps.id) FILTER (WHERE ps.points IS NULL) > 0
      ORDER BY p.nom
    `)

    console.log(`${people.length} personne(s) décédée(s) avec des points manquants`)

    for (const person of people) {
      const age = calculateAge(person.date_naissance, person.date_deces)
      const points = age === null ? MIN_POINTS : Math.max(MIN_POINTS, 100 - age)
      console.log(`- ${person.prenom} ${person.nom} : âge ${age}, ${points} pts, ${person.null_points} sélection(s) à corriger`)
      if (APPLY) {
        await db.query(
          `UPDATE "playerSelection" SET points = $1 WHERE person_id = $2 AND points IS NULL`,
          [points, person.id]
        )
      }
    }
  } catch (err) {
    console.error('Erreur :', err.message)
    process.exitCode = 1
  } finally {
    await db.end()
  }
})()
