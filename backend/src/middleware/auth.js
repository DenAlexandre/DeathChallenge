const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Accès refusé' })
  }
  next()
}

module.exports = { authenticate, requireRole }
