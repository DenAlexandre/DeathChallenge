const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' })
  }
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
    [req.user.id]
  )
  res.json(rows[0] || null)
})

module.exports = router
