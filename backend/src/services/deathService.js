const db = require('../db')

function calculateAge(dateNaissance, dateDeces) {
  if (!dateNaissance) return null
  const death = new Date(dateDeces)
  const birth = new Date(dateNaissance)
  let age = death.getFullYear() - birth.getFullYear()
  const monthDiff = death.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) age--
  return age
}

const MIN_POINTS = 10

// Applique un décès considéré comme acquis (validé par un admin, ou immédiat si
// la règle "validation_admin" est désactivée) : renseigne date_deces (qui fait
// foi), efface tout signalement en attente, et attribue les points (si la règle
// "points_calcul" est active) aux joueurs ayant la personne en sélection.
async function applyDeath(personId, dateDeces, pointsRuleActive) {
  const { rows } = await db.query(
    `UPDATE "personnalite"
     SET date_deces = $1, date_deces_proposee = NULL, deces_signale_par = NULL
     WHERE id = $2
     RETURNING date_naissance, sans_points`,
    [dateDeces, personId]
  )
  if (!rows[0]) return false

  // Exception par personnalité : ne rapporte jamais de points, quels que
  // soient la règle "points_calcul" ou les bonus actifs.
  if (pointsRuleActive && !rows[0].sans_points) {
    const age = calculateAge(rows[0].date_naissance, dateDeces)
    const points = age === null ? MIN_POINTS : Math.max(MIN_POINTS, 100 - age)
    await db.query(`UPDATE "playerSelection" SET points = $1 WHERE person_id = $2`, [points, personId])
  }
  return true
}

module.exports = { calculateAge, applyDeath }
