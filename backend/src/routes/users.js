const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at'
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
