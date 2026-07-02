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

// Applique les conséquences d'un décès considéré comme acquis (validé par un admin, ou
// immédiat si la règle "validation_admin" est désactivée) : attribue les points (si la
// règle "points_calcul" est active) aux joueurs ayant la personne en sélection, puis
// retire la ligne alivePerson (ou la marque "decedee" si un joueur l'a en sélection, pour
// ne pas perdre — via la cascade FK — son historique de pari).
async function applyDeathToAlivePerson(alivePersonId, dateDeces, pointsRuleActive) {
  const { rows: personRows } = await db.query(
    `SELECT date_naissance FROM "alivePerson" WHERE id = $1`,
    [alivePersonId]
  )
  const { rows: selectionRows } = await db.query(
    `SELECT 1 FROM "playerSelection" WHERE alive_person_id = $1 LIMIT 1`,
    [alivePersonId]
  )

  if (pointsRuleActive && selectionRows[0] && personRows[0]) {
    const age = calculateAge(personRows[0].date_naissance, dateDeces)
    const points = age === null ? 0 : Math.max(0, 100 - age)
    await db.query(`UPDATE "playerSelection" SET points = $1 WHERE alive_person_id = $2`, [points, alivePersonId])
  }

  if (selectionRows[0]) {
    await db.query(`UPDATE "alivePerson" SET statut = 'decedee' WHERE id = $1`, [alivePersonId])
  } else {
    await db.query(`DELETE FROM "alivePerson" WHERE id = $1`, [alivePersonId])
  }
}

module.exports = { calculateAge, applyDeathToAlivePerson }
