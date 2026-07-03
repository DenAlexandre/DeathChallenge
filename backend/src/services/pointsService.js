// Deux bonus s'appliquent au calcul des points d'un joueur, tous deux
// pilotables depuis la page Options système :
//
// - "bonus_unique" : si une personnalité n'a été sélectionnée que par un
//   seul joueur au moment de son décès, ce joueur reçoit des points bonus
//   supplémentaires (ajoutés aux points de base de cette personnalité, avant
//   tout autre calcul).
// - "bonus_meme_jour" : si un joueur a 2 personnalités (ou plus) mortes le
//   même jour dans sa liste, leurs points (bonus unique déjà inclus) sont
//   additionnés puis majorés (arrondi à l'entier supérieur), au lieu d'une
//   simple somme individuelle.

// rows: [{ userId, username, points, dateKey, selectorCount }] — une ligne
// par sélection dont la mort a été validée (points déjà attribués).
// selectorCount = nombre total de joueurs ayant sélectionné cette même
// personnalité (tous comptes confondus) — sert à détecter le pick unique.
function computeLeaderboardTotals(
  rows,
  sameDayBonus = { active: true, pourcentage: 50 },
  uniqueBonus = { active: true, montant: 10 }
) {
  const byUser = new Map()

  for (const row of rows) {
    if (!byUser.has(row.userId)) {
      byUser.set(row.userId, { id: row.userId, username: row.username, groups: new Map(), deces_count: 0 })
    }
    const user = byUser.get(row.userId)

    const points = uniqueBonus.active && row.selectorCount === 1
      ? row.points + (uniqueBonus.montant ?? 10)
      : row.points

    if (!user.groups.has(row.dateKey)) user.groups.set(row.dateKey, [])
    user.groups.get(row.dateKey).push(points)
    user.deces_count++
  }

  const multiplier = 1 + (sameDayBonus.pourcentage ?? 50) / 100

  return [...byUser.values()].map(user => {
    let total_points = 0
    for (const points of user.groups.values()) {
      const sum = points.reduce((a, b) => a + b, 0)
      total_points += sameDayBonus.active && points.length >= 2 ? Math.ceil(sum * multiplier) : sum
    }
    return { id: user.id, username: user.username, total_points, deces_count: user.deces_count }
  })
}

module.exports = { computeLeaderboardTotals }
