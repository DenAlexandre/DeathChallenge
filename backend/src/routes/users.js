const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')
const { getRegle } = require('../regles')
const { computeLeaderboardTotals } = require('../services/pointsService')

const router = express.Router()

router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(`
    SELECT u.id, u.username, u.email, u.role, u.created_at,
           COUNT(ps.id)::int AS selection_count
    FROM users u
    LEFT JOIN "playerSelection" ps ON ps.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at
  `)
  res.json(rows)
})

router.get('/leaderboard', authenticate, async (req, res) => {
  const { rows: users } = await db.query('SELECT id, username FROM users ORDER BY username')
  const { rows: deaths } = await db.query(`
    SELECT ps.user_id AS "userId", u.username, ps.points,
           to_char(p.date_deces, 'YYYY-MM-DD') AS "dateKey"
    FROM "playerSelection" ps
    JOIN users u ON u.id = ps.user_id
    JOIN "personnalite" p ON p.id = ps.person_id
    WHERE ps.points IS NOT NULL
  `)
  const bonusRegle = await getRegle('bonus_meme_jour')
  const bonus = { active: bonusRegle?.active !== false, pourcentage: bonusRegle?.valeur ?? 50 }
  const totals = new Map(computeLeaderboardTotals(deaths, bonus).map(t => [t.id, t]))
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

router.get('/:id/selections', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.id, s.points, p.id AS person_id, p.nom, p.prenom, p.categorie,
            p.date_naissance, p.nationalite, p.statut,
            (p.date_deces IS NOT NULL) AS deja_decede
     FROM "playerSelection" s
     JOIN "personnalite" p ON p.id = s.person_id
     WHERE s.user_id = $1
     ORDER BY p.nom, p.prenom`,
    [req.params.id]
  )
  res.json(rows)
})

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { username, email, password, role } = req.body
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' })
  }
  if (!['admin', 'joueur'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [username.trim(), email || null, hash, role]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Identifiant déjà utilisé' })
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { username, email, password, role } = req.body
  try {
    let result
    if (password) {
      const hash = await bcrypt.hash(password, 10)
      result = await db.query(
        `UPDATE users SET
          username      = COALESCE($1, username),
          email         = $2,
          password_hash = $3,
          role          = COALESCE($4, role)
         WHERE id = $5
         RETURNING id, username, email, role, created_at`,
        [username?.trim() || null, email || null, hash, role, req.params.id]
      )
    } else {
      result = await db.query(
        `UPDATE users SET
          username = COALESCE($1, username),
          email    = $2,
          role     = COALESCE($3, role)
         WHERE id = $4
         RETURNING id, username, email, role, created_at`,
        [username?.trim() || null, email || null, role, req.params.id]
      )
    }
    if (!result.rows[0]) return res.status(404).json({ error: 'Utilisateur non trouvé' })
    res.json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Identifiant déjà utilisé' })
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' })
  }
  const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
