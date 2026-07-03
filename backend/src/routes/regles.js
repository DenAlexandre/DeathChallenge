const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')
const { invalidateRegles, getRegle } = require('../regles')
const { computeLeaderboardTotals } = require('../services/pointsService')

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  const { rows } = await db.query('SELECT id, code, nom, description, active, valeur FROM "regles" ORDER BY id')
  res.json(rows)
})

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const active = req.body.active === undefined ? null : req.body.active
  const valeur = req.body.valeur === undefined ? null : req.body.valeur
  const { rows } = await db.query(
    `UPDATE "regles" SET
       active = COALESCE($1, active),
       valeur = COALESCE($2, valeur)
     WHERE id = $3
     RETURNING id, code, nom, description, active, valeur`,
    [active, valeur, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Règle non trouvée' })
  invalidateRegles()
  res.json(rows[0])
})

router.post('/reset-selections', authenticate, requireRole('admin'), async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM "playerSelection"')
  res.json({ message: 'Sélections réinitialisées', count: rowCount })
})

router.get('/points-annee', authenticate, requireRole('admin'), async (req, res) => {
  const { rows: users } = await db.query('SELECT id, username FROM users ORDER BY username')
  const { rows: deaths } = await db.query(`
    SELECT ps.user_id AS "userId", u.username, ps.points,
           to_char(p.date_deces, 'YYYY-MM-DD') AS "dateKey",
           COUNT(*) OVER (PARTITION BY ps.person_id)::int AS "selectorCount"
    FROM "playerSelection" ps
    JOIN users u ON u.id = ps.user_id
    JOIN "personnalite" p ON p.id = ps.person_id
    WHERE ps.points IS NOT NULL AND p.date_deces >= date_trunc('year', CURRENT_DATE)
  `)
  const [sameDayRegle, uniqueRegle] = await Promise.all([
    getRegle('bonus_meme_jour'),
    getRegle('bonus_unique'),
  ])
  const sameDayBonus = { active: sameDayRegle?.active !== false, pourcentage: sameDayRegle?.valeur ?? 50 }
  const uniqueBonus = { active: uniqueRegle?.active !== false, montant: uniqueRegle?.valeur ?? 10 }
  const totals = new Map(computeLeaderboardTotals(deaths, sameDayBonus, uniqueBonus).map(t => [t.id, t]))
  const result = users
    .map(u => ({
      id: u.id,
      username: u.username,
      total_points: totals.get(u.id)?.total_points ?? 0,
      deces_count: totals.get(u.id)?.deces_count ?? 0,
    }))
    .sort((a, b) => b.total_points - a.total_points || a.username.localeCompare(b.username))
  res.json(result)
})

module.exports = router
