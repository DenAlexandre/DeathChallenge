const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/pending', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT e.id, e.person_id, e.nom, e.prenom, e.categorie, e.nationalite, e.date_naissance,
            p.nom AS nom_actuel, p.prenom AS prenom_actuel, p.categorie AS categorie_actuel,
            p.nationalite AS nationalite_actuel, p.date_naissance AS date_naissance_actuel,
            u.username AS proposed_by
     FROM "personEdit" e
     JOIN "personnalite" p ON p.id = e.person_id
     LEFT JOIN users u ON u.id = e.created_by
     ORDER BY e.id`
  )
  res.json(rows)
})

router.put('/:id/validate', authenticate, requireRole('admin'), async (req, res) => {
  const { rows: editRows } = await db.query('SELECT * FROM "personEdit" WHERE id = $1', [req.params.id])
  const edit = editRows[0]
  if (!edit) return res.status(404).json({ error: 'Modification non trouvée' })

  await db.query(
    `UPDATE "personnalite" SET nom = $1, prenom = $2, categorie = $3, nationalite = $4, date_naissance = $5
     WHERE id = $6`,
    [edit.nom, edit.prenom, edit.categorie, edit.nationalite, edit.date_naissance, edit.person_id]
  )
  await db.query('DELETE FROM "personEdit" WHERE id = $1', [req.params.id])
  res.json({ message: 'Modification appliquée' })
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('DELETE FROM "personEdit" WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Modification non trouvée' })
  res.json({ message: 'Rejetée' })
})

module.exports = router
