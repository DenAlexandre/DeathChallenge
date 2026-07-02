const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/stats', authenticate, async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE is_alive = true)::int  AS alive,
      COUNT(*) FILTER (WHERE is_alive = false)::int AS deceased
    FROM persons
  `)
  res.json(rows[0])
})

router.get('/', authenticate, async (req, res) => {
  const { search, nationalite, categorie, alive } = req.query
  const conditions = []
  const params = []
  let idx = 1

  if (search) {
    conditions.push(`(
      nom      ILIKE $${idx} OR
      prenom   ILIKE $${idx} OR
      CONCAT(prenom, ' ', nom) ILIKE $${idx} OR
      CONCAT(nom,    ' ', prenom) ILIKE $${idx}
    )`)
    params.push(`%${search}%`)
    idx++
  }
  if (nationalite) {
    conditions.push(`nationalite ILIKE $${idx}`)
    params.push(`%${nationalite}%`)
    idx++
  }
  if (categorie) {
    conditions.push(`categorie ILIKE $${idx}`)
    params.push(`%${categorie}%`)
    idx++
  }
  if (alive === 'true')  conditions.push('is_alive = true')
  if (alive === 'false') conditions.push('is_alive = false')

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await db.query(
    `SELECT p.*, u.username AS created_by_username
     FROM persons p
     LEFT JOIN users u ON p.created_by = u.id
     ${where}
     ORDER BY p.nom, p.prenom`,
    params
  )
  res.json(rows)
})

router.get('/:id', authenticate, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM persons WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json(rows[0])
})

router.post('/', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  const { nom, prenom, date_naissance, nationalite, categorie, description } = req.body
  if (!nom?.trim() || !prenom?.trim()) {
    return res.status(400).json({ error: 'Nom et prénom sont obligatoires' })
  }
  const { rows } = await db.query(
    `INSERT INTO persons (nom, prenom, date_naissance, nationalite, categorie, description, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [nom.trim(), prenom.trim(), date_naissance || null, nationalite || null, categorie || null, description || null, req.user.id]
  )
  res.status(201).json(rows[0])
})

router.put('/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  const { nom, prenom, date_naissance, nationalite, categorie, description, is_alive, deceased_at } = req.body
  const { rows } = await db.query(
    `UPDATE persons SET
      nom          = COALESCE($1, nom),
      prenom       = COALESCE($2, prenom),
      date_naissance = $3,
      nationalite  = $4,
      categorie    = $5,
      description  = $6,
      is_alive     = COALESCE($7, is_alive),
      deceased_at  = $8
     WHERE id = $9
     RETURNING *`,
    [
      nom?.trim() || null,
      prenom?.trim() || null,
      date_naissance || null,
      nationalite || null,
      categorie || null,
      description || null,
      is_alive != null ? is_alive : null,
      deceased_at || null,
      req.params.id,
    ]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json(rows[0])
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('DELETE FROM persons WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
