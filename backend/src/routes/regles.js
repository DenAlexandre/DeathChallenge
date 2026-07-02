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

module.exports = router
