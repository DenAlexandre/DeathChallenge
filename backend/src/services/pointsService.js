// Un joueur qui a 2 personnalités (ou plus) mortes le même jour dans sa liste
// voit leurs points additionnés puis majorés (arrondi à l'entier supérieur),
// au lieu d'une simple somme individuelle — piloté par la règle
// "bonus_meme_jour" (active + pourcentage configurable côté admin).

// rows: [{ userId, username, points, dateKey }] — une ligne par sélection
// dont la mort a été validée (points déjà attribués).
// bonus: { active, pourcentage } — règle "bonus_meme_jour" ; si inactive, les
// points sont simplement additionnés sans majoration.
function computeLeaderboardTotals(rows, bonus = { active: true, pourcentage: 50 }) {
  const byUser = new Map()

  for (const row of rows) {
    if (!byUser.has(row.userId)) {
      byUser.set(row.userId, { id: row.userId, username: row.username, groups: new Map(), deces_count: 0 })
    }
    const user = byUser.get(row.userId)
    if (!user.groups.has(row.dateKey)) user.groups.set(row.dateKey, [])
    user.groups.get(row.dateKey).push(row.points)
    user.deces_count++
  }

  const multiplier = 1 + (bonus.pourcentage ?? 50) / 100

  return [...byUser.values()].map(user => {
    let total_points = 0
    for (const points of user.groups.values()) {
      const sum = points.reduce((a, b) => a + b, 0)
      total_points += bonus.active && points.length >= 2 ? Math.ceil(sum * multiplier) : sum
    }
    return { id: user.id, username: user.username, total_points, deces_count: user.deces_count }
  })
}

module.exports = { computeLeaderboardTotals }
