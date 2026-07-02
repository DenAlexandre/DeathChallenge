const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')
const { getRegle } = require('../regles')
const { applyDeath } = require('../services/deathService')

const router = express.Router()

// Recherche joueur : personnes vivantes sélectionnables + décès homonymes
// (pour avertir qu'une personne cherchée est déjà morte).
router.get('/', authenticate, async (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 2) return res.json({ results: [], deathMatches: [] })

  const like = `%${q}%`

  const { rows: results } = await db.query(
    `SELECT id, nom, prenom, categorie, date_naissance, nationalite, statut
     FROM "personnalite"
     WHERE statut = 'validee' AND date_deces IS NULL AND (nom ILIKE $1 OR prenom ILIKE $1)
     ORDER BY nom, prenom
     LIMIT 20`,
    [like]
  )

  const { rows: deathMatches } = await db.query(
    `SELECT nom, prenom, categorie, date_deces
     FROM "personnalite"
     WHERE statut = 'validee' AND date_deces IS NOT NULL AND (nom ILIKE $1 OR prenom ILIKE $1)
     LIMIT 5`,
    [like]
  )

  res.json({ results, deathMatches })
})

router.get('/all', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, nom, prenom, categorie, nationalite, date_naissance, date_deces, statut
     FROM "personnalite" ORDER BY nom, prenom`
  )
  res.json(rows)
})

// Nouvelles personnalités vivantes proposées par des joueurs.
router.get('/pending', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.nom, p.prenom, p.categorie, p.date_naissance, p.nationalite,
            u.username AS proposed_by
     FROM "personnalite" p
     LEFT JOIN users u ON u.id = p.created_by
     WHERE p.statut = 'en_attente' AND p.date_deces IS NULL
     ORDER BY p.id`
  )
  res.json(rows)
})

// Décès en attente de validation : signalements sur une personne existante
// (date_deces_proposee) et décès inédits proposés à la création (statut
// en_attente + date_deces). date_deces renvoyée = la date à valider.
router.get('/pending-deaths', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.nom, p.prenom, p.categorie, p.date_naissance, p.nationalite,
            COALESCE(p.date_deces_proposee, p.date_deces) AS date_deces,
            (p.date_deces_proposee IS NOT NULL) AS is_report,
            COALESCE(us.username, uc.username) AS proposed_by
     FROM "personnalite" p
     LEFT JOIN users us ON us.id = p.deces_signale_par
     LEFT JOIN users uc ON uc.id = p.created_by
     WHERE p.date_deces_proposee IS NOT NULL
        OR (p.statut = 'en_attente' AND p.date_deces IS NOT NULL)
     ORDER BY p.id`
  )
  res.json(rows)
})

// Création (par un joueur ou un admin) : vivante ou décédée selon la présence
// de date_deces. Passe par la validation admin si la règle est active.
router.post('/', authenticate, async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance, date_deces } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const { rows: existing } = await db.query(
    `SELECT id FROM "personnalite"
     WHERE lower(nom) = lower($1) AND lower(COALESCE(prenom, '')) = lower($2) AND statut = 'validee'`,
    [nom.trim(), prenom.trim()]
  )
  if (existing[0]) {
    return res.status(409).json({ error: 'Cette personne existe déjà dans la base' })
  }

  const validationRegle = await getRegle('validation_admin')
  const statut = validationRegle?.active === false ? 'validee' : 'en_attente'

  const { rows } = await db.query(
    `INSERT INTO "personnalite" (nom, prenom, categorie, nationalite, date_naissance, date_deces, statut, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, nom, prenom, categorie, date_naissance, date_deces, nationalite, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, date_deces || null, statut, req.user.id]
  )
  res.status(201).json(rows[0])
})

// Signalement du décès d'une personne vivante existante.
router.post('/:id/report-death', authenticate, async (req, res) => {
  const { date_deces } = req.body
  if (!date_deces) return res.status(400).json({ error: 'Date de décès requise' })

  const { rows: personRows } = await db.query(
    `SELECT id, date_deces_proposee FROM "personnalite"
     WHERE id = $1 AND statut = 'validee' AND date_deces IS NULL`,
    [req.params.id]
  )
  const person = personRows[0]
  if (!person) return res.status(404).json({ error: 'Personne non trouvée' })
  if (person.date_deces_proposee) {
    return res.status(409).json({ error: 'Un décès est déjà en attente de validation pour cette personne' })
  }

  const validationRegle = await getRegle('validation_admin')

  // Validation désactivée : le décès prend effet tout de suite, pas d'attente admin.
  if (validationRegle?.active === false) {
    const pointsRegle = await getRegle('points_calcul')
    await applyDeath(person.id, date_deces, pointsRegle?.active !== false)
    return res.status(200).json({ applied: true })
  }

  await db.query(
    `UPDATE "personnalite" SET date_deces_proposee = $1, deces_signale_par = $2 WHERE id = $3`,
    [date_deces, req.user.id, req.params.id]
  )
  res.status(201).json({ applied: false })
})

// Validation d'une nouvelle personnalité vivante proposée.
router.put('/:id/validate', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `UPDATE "personnalite" SET statut = 'validee' WHERE id = $1 RETURNING id, nom, prenom, statut`,
    [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json(rows[0])
})

// Validation d'un décès en attente (signalement ou décès inédit).
router.put('/:id/validate-death', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, statut, date_deces, date_deces_proposee FROM "personnalite" WHERE id = $1`,
    [req.params.id]
  )
  const person = rows[0]
  if (!person) return res.status(404).json({ error: 'Personne non trouvée' })

  if (person.date_deces_proposee) {
    const pointsRegle = await getRegle('points_calcul')
    await applyDeath(person.id, person.date_deces_proposee, pointsRegle?.active !== false)
  } else if (person.statut === 'en_attente' && person.date_deces) {
    // Décès inédit proposé à la création : personne jamais sélectionnable, pas de points.
    await db.query(`UPDATE "personnalite" SET statut = 'validee' WHERE id = $1`, [person.id])
  } else {
    return res.status(400).json({ error: 'Aucun décès en attente pour cette personne' })
  }
  res.json({ message: 'Décès validé' })
})

// Rejet d'un décès en attente : efface le signalement (la personne reste
// vivante), ou supprime la ligne s'il s'agissait d'un décès inédit proposé.
router.delete('/:id/death-report', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, statut, date_deces, date_deces_proposee FROM "personnalite" WHERE id = $1`,
    [req.params.id]
  )
  const person = rows[0]
  if (!person) return res.status(404).json({ error: 'Personne non trouvée' })

  if (person.date_deces_proposee) {
    await db.query(
      `UPDATE "personnalite" SET date_deces_proposee = NULL, deces_signale_par = NULL WHERE id = $1`,
      [person.id]
    )
  } else if (person.statut === 'en_attente' && person.date_deces) {
    await db.query(`DELETE FROM "personnalite" WHERE id = $1`, [person.id])
  } else {
    return res.status(400).json({ error: 'Aucun décès en attente pour cette personne' })
  }
  res.json({ message: 'Rejeté' })
})

// Édition directe par un admin, appliquée immédiatement. Si l'admin renseigne
// une date_deces sur une personne vivante, le décès est appliqué avec la
// logique de points habituelle.
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance, date_deces } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const { rows: beforeRows } = await db.query(`SELECT date_deces FROM "personnalite" WHERE id = $1`, [req.params.id])
  if (!beforeRows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  const wasAlive = beforeRows[0].date_deces === null

  const { rows } = await db.query(
    `UPDATE "personnalite" SET nom = $1, prenom = $2, categorie = $3, nationalite = $4, date_naissance = $5, date_deces = $6
     WHERE id = $7
     RETURNING id, nom, prenom, categorie, nationalite, date_naissance, date_deces, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, date_deces || null, req.params.id]
  )

  if (wasAlive && date_deces) {
    const pointsRegle = await getRegle('points_calcul')
    await applyDeath(req.params.id, date_deces, pointsRegle?.active !== false)
  }

  res.json(rows[0])
})

// Proposition de modification par un joueur (validée ensuite par un admin).
router.post('/:id/propose-edit', authenticate, async (req, res) => {
  const { nom, prenom, categorie, nationalite, date_naissance } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom requis' })
  }

  const { rows: personRows } = await db.query(
    `SELECT id FROM "personnalite" WHERE id = $1 AND statut = 'validee' AND date_deces IS NULL`,
    [req.params.id]
  )
  if (!personRows[0]) return res.status(404).json({ error: 'Personne non trouvée' })

  const { rows: existingEdit } = await db.query(
    `SELECT id FROM "personEdit" WHERE person_id = $1`,
    [req.params.id]
  )
  if (existingEdit[0]) {
    return res.status(409).json({ error: 'Une modification est déjà en attente de validation pour cette personne' })
  }

  const validationRegle = await getRegle('validation_admin')

  if (validationRegle?.active === false) {
    const { rows } = await db.query(
      `UPDATE "personnalite" SET nom = $1, prenom = $2, categorie = $3, nationalite = $4, date_naissance = $5
       WHERE id = $6
       RETURNING id, nom, prenom, categorie, nationalite, date_naissance, statut`,
      [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, req.params.id]
    )
    return res.status(200).json({ applied: true, person: rows[0] })
  }

  const { rows } = await db.query(
    `INSERT INTO "personEdit" (person_id, nom, prenom, categorie, nationalite, date_naissance, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [req.params.id, nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, req.user.id]
  )
  res.status(201).json({ applied: false, id: rows[0].id })
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('DELETE FROM "personnalite" WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
