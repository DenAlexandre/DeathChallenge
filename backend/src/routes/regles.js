const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')
const { invalidateRegles } = require('../regles')

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
  const { rows } = await db.query(`
    SELECT u.id, u.username,
           COALESCE(SUM(CASE WHEN p.date_deces >= date_trunc('year', CURRENT_DATE) THEN ps.points ELSE 0 END), 0)::int AS total_points,
           COUNT(CASE WHEN p.date_deces >= date_trunc('year', CURRENT_DATE) THEN ps.points END)::int AS deces_count
    FROM users u
    LEFT JOIN "playerSelection" ps ON ps.user_id = u.id
    LEFT JOIN "personnalite" p ON p.id = ps.person_id
    GROUP BY u.id, u.username
    ORDER BY total_points DESC, u.username
  `)
  res.json(rows)
})

module.exports = router
