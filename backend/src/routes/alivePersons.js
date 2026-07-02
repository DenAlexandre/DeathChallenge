const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')
const { getRegle } = require('../regles')
const { applyDeathToAlivePerson } = require('../services/deathService')

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 2) return res.json({ results: [], deathMatches: [] })

  const like = `%${q}%`

  const { rows: results } = await db.query(
    `SELECT ap.id, ap.nom, ap.prenom, ap.categorie, ap.date_naissance, ap.nationalite, ap.statut,
            EXISTS (
              SELECT 1 FROM "deathPerson" dp
              WHERE dp.statut = 'validee'
                AND lower(dp.nom) = lower(ap.nom) AND lower(dp.prenom) = lower(ap.prenom)
            ) AS deja_decede
     FROM "alivePerson" ap
     WHERE ap.statut = 'validee' AND (ap.nom ILIKE $1 OR ap.prenom ILIKE $1)
     ORDER BY ap.nom, ap.prenom
     LIMIT 20`,
    [like]
  )

  const { rows: deathMatches } = await db.query(
    `SELECT nom, prenom, categorie, date_deces FROM "deathPerson"
     WHERE statut = 'validee' AND (nom ILIKE $1 OR prenom ILIKE $1)
     LIMIT 5`,
    [like]
  )

  res.json({ results, deathMatches })
})

router.get('/pending', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT ap.id, ap.nom, ap.prenom, ap.categorie, ap.date_naissance, ap.nationalite,
            u.username AS proposed_by
     FROM "alivePerson" ap
     LEFT JOIN users u ON u.id = ap.created_by
     WHERE ap.statut = 'en_attente'
     ORDER BY ap.id`
  )
  res.json(rows)
})

router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, nom, prenom, categorie, nationalite, date_naissance, statut
     FROM "alivePerson" ORDER BY nom, prenom`
  )
  res.json(rows)
})

router.post('/', authenticate, async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const { rows: existing } = await db.query(
    `SELECT id FROM "alivePerson" WHERE lower(nom) = lower($1) AND lower(prenom) = lower($2) AND statut = 'validee'`,
    [nom.trim(), prenom.trim()]
  )
  if (existing[0]) {
    return res.status(409).json({ error: 'Cette personne existe déjà dans la base' })
  }

  const validationRegle = await getRegle('validation_admin')
  const statut = validationRegle?.active === false ? 'validee' : 'en_attente'

  const { rows } = await db.query(
    `INSERT INTO "alivePerson" (nom, prenom, categorie, nationalite, date_naissance, statut, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, nom, prenom, categorie, date_naissance, nationalite, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, statut, req.user.id]
  )
  res.status(201).json(rows[0])
})

router.post('/:id/report-death', authenticate, async (req, res) => {
  const { date_deces } = req.body
  if (!date_deces) return res.status(400).json({ error: 'Date de décès requise' })

  const { rows: personRows } = await db.query(
    `SELECT id, nom, prenom, categorie, nationalite, date_naissance FROM "alivePerson"
     WHERE id = $1 AND statut = 'validee'`,
    [req.params.id]
  )
  const person = personRows[0]
  if (!person) return res.status(404).json({ error: 'Personne non trouvée' })

  const { rows: existingDeath } = await db.query(
    `SELECT id FROM "deathPerson" WHERE lower(nom) = lower($1) AND lower(prenom) = lower($2) AND statut IN ('en_attente', 'validee')`,
    [person.nom, person.prenom]
  )
  if (existingDeath[0]) {
    return res.status(409).json({ error: 'Un décès est déjà enregistré ou en attente de validation pour cette personne' })
  }

  const validationRegle = await getRegle('validation_admin')
  const statut = validationRegle?.active === false ? 'validee' : 'en_attente'

  const { rows } = await db.query(
    `INSERT INTO "deathPerson" (nom, prenom, categorie, nationalite, date_naissance, date_deces, statut, created_by, alive_person_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, nom, prenom, categorie, date_naissance, date_deces, nationalite, statut`,
    [person.nom, person.prenom, person.categorie, person.nationalite, person.date_naissance, date_deces, statut, req.user.id, person.id]
  )

  // Validation désactivée : le décès prend effet tout de suite, pas d'attente admin.
  if (statut === 'validee') {
    const pointsRegle = await getRegle('points_calcul')
    await applyDeathToAlivePerson(person.id, date_deces, pointsRegle?.active !== false)
  }

  res.status(201).json(rows[0])
})

router.put('/:id/validate', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `UPDATE "alivePerson" SET statut = 'validee' WHERE id = $1 RETURNING id, nom, prenom, statut`,
    [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json(rows[0])
})

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const { rows } = await db.query(
    `UPDATE "alivePerson" SET nom = $1, prenom = $2, categorie = $3, nationalite = $4, date_naissance = $5
     WHERE id = $6
     RETURNING id, nom, prenom, categorie, nationalite, date_naissance, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json(rows[0])
})

router.post('/:id/propose-edit', authenticate, async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const { rows: personRows } = await db.query(
    `SELECT id FROM "alivePerson" WHERE id = $1 AND statut = 'validee'`,
    [req.params.id]
  )
  if (!personRows[0]) return res.status(404).json({ error: 'Personne non trouvée' })

  const { rows: existingEdit } = await db.query(
    `SELECT id FROM "alivePersonEdit" WHERE alive_person_id = $1`,
    [req.params.id]
  )
  if (existingEdit[0]) {
    return res.status(409).json({ error: 'Une modification est déjà en attente de validation pour cette personne' })
  }

  const validationRegle = await getRegle('validation_admin')

  if (validationRegle?.active === false) {
    const { rows } = await db.query(
      `UPDATE "alivePerson" SET nom = $1, prenom = $2, categorie = $3, nationalite = $4, date_naissance = $5
       WHERE id = $6
       RETURNING id, nom, prenom, categorie, nationalite, date_naissance, statut`,
      [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, req.params.id]
    )
    return res.status(200).json({ applied: true, person: rows[0] })
  }

  const { rows } = await db.query(
    `INSERT INTO "alivePersonEdit" (alive_person_id, nom, prenom, categorie, nationalite, date_naissance, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [req.params.id, nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, req.user.id]
  )
  res.status(201).json({ applied: false, id: rows[0].id })
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('DELETE FROM "alivePerson" WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
