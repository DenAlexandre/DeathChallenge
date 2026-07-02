const express = require('express')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

const MAX_SELECTION = 10

router.get('/', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.id, s.points, ap.id AS alive_person_id, ap.nom, ap.prenom, ap.categorie,
            ap.annee_naissance, ap.date_naissance, ap.nationalite, ap.statut,
            EXISTS (
              SELECT 1 FROM "deathPerson" dp
              WHERE dp.statut = 'validee'
                AND lower(dp.nom) = lower(ap.nom) AND lower(dp.prenom) = lower(ap.prenom)
            ) AS deja_decede
     FROM "playerSelection" s
     JOIN "alivePerson" ap ON ap.id = s.alive_person_id
     WHERE s.user_id = $1
     ORDER BY s.created_at`,
    [req.user.id]
  )
  res.json(rows)
})

router.post('/', authenticate, async (req, res) => {
  const { alivePersonId } = req.body
  if (!alivePersonId) return res.status(400).json({ error: 'alivePersonId requis' })

  const { rows: countRows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM "playerSelection" WHERE user_id = $1',
    [req.user.id]
  )
  if (countRows[0].count >= MAX_SELECTION) {
    return res.status(400).json({ error: `Liste déjà complète (${MAX_SELECTION}/${MAX_SELECTION})` })
  }

  const { rows: personRows } = await db.query('SELECT nom, prenom FROM "alivePerson" WHERE id = $1', [alivePersonId])
  const person = personRows[0]
  if (!person) return res.status(404).json({ error: 'Personne non trouvée' })

  const { rows: deathRows } = await db.query(
    `SELECT 1 FROM "deathPerson" WHERE statut = 'validee' AND lower(nom) = lower($1) AND lower(prenom) = lower($2)`,
    [person.nom, person.prenom]
  )
  if (deathRows[0]) {
    return res.status(400).json({ error: 'Cette personne est déjà décédée, sélection refusée' })
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO "playerSelection" (user_id, alive_person_id) VALUES ($1, $2) RETURNING id`,
      [req.user.id, alivePersonId]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Cette personne est déjà dans votre liste' })
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', authenticate, async (req, res) => {
  const { rows } = await db.query(
    'DELETE FROM "playerSelection" WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Sélection non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
