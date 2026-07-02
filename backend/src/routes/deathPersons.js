const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')
const { getRegle } = require('../regles')
const { applyDeathToAlivePerson } = require('../services/deathService')

const router = express.Router()

router.get('/pending', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT dp.id, dp.nom, dp.prenom, dp.categorie, dp.date_naissance, dp.date_deces, dp.nationalite,
            u.username AS proposed_by
     FROM "deathPerson" dp
     LEFT JOIN users u ON u.id = dp.created_by
     WHERE dp.statut = 'en_attente'
     ORDER BY dp.id`
  )
  res.json(rows)
})

router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, nom, prenom, categorie, nationalite, date_naissance, date_deces, statut
     FROM "deathPerson" ORDER BY nom, prenom`
  )
  res.json(rows)
})

router.post('/', authenticate, async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance, date_deces } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }
  if (!date_deces) {
    return res.status(400).json({ error: 'Date de décès requise' })
  }

  const { rows: existing } = await db.query(
    `SELECT id FROM "deathPerson" WHERE lower(nom) = lower($1) AND lower(prenom) = lower($2) AND statut = 'validee'`,
    [nom.trim(), prenom.trim()]
  )
  if (existing[0]) {
    return res.status(409).json({ error: 'Cette personne existe déjà dans la base des décès' })
  }

  const validationRegle = await getRegle('validation_admin')
  const statut = validationRegle?.active === false ? 'validee' : 'en_attente'

  const { rows } = await db.query(
    `INSERT INTO "deathPerson" (nom, prenom, categorie, nationalite, date_naissance, date_deces, statut, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, nom, prenom, categorie, date_naissance, date_deces, nationalite, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, date_deces, statut, req.user.id]
  )
  res.status(201).json(rows[0])
})

router.put('/:id/validate', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `UPDATE "deathPerson" SET statut = 'validee' WHERE id = $1
     RETURNING id, nom, prenom, statut, alive_person_id, date_deces`,
    [req.params.id]
  )
  const deathPerson = rows[0]
  if (!deathPerson) return res.status(404).json({ error: 'Personne non trouvée' })

  if (deathPerson.alive_person_id) {
    const pointsRegle = await getRegle('points_calcul')
    await applyDeathToAlivePerson(deathPerson.alive_person_id, deathPerson.date_deces, pointsRegle?.active !== false)
  }

  res.json({ id: deathPerson.id, nom: deathPerson.nom, prenom: deathPerson.prenom, statut: deathPerson.statut })
})

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance, date_deces } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }
  if (!date_deces) {
    return res.status(400).json({ error: 'Date de décès requise' })
  }

  const { rows } = await db.query(
    `UPDATE "deathPerson" SET nom = $1, prenom = $2, categorie = $3, nationalite = $4, date_naissance = $5, date_deces = $6
     WHERE id = $7
     RETURNING id, nom, prenom, categorie, nationalite, date_naissance, date_deces, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, date_deces, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json(rows[0])
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('DELETE FROM "deathPerson" WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
