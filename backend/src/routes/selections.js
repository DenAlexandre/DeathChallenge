const express = require('express')
const db = require('../db')
const { authenticate } = require('../middleware/auth')
const { getRegle } = require('../regles')

async function checkNotFrozen(res) {
  const regle = await getRegle('selections_gelees')
  if (regle?.active) {
    res.status(403).json({ error: 'Les ajouts et suppressions de personnalités sont actuellement gelés par un administrateur' })
    return false
  }
  return true
}

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.id, s.points, p.id AS person_id, p.nom, p.prenom, p.categorie,
            p.date_naissance, p.nationalite, p.statut,
            (p.date_deces IS NOT NULL) AS deja_decede
     FROM "playerSelection" s
     JOIN "personnalite" p ON p.id = s.person_id
     WHERE s.user_id = $1
     ORDER BY s.created_at`,
    [req.user.id]
  )
  res.json(rows)
})

router.post('/', authenticate, async (req, res) => {
  if (!(await checkNotFrozen(res))) return
  const { personId } = req.body
  if (!personId) return res.status(400).json({ error: 'personId requis' })

  const limiteRegle = await getRegle('limite_selection')
  if (limiteRegle?.active !== false) {
    const limite = limiteRegle?.valeur ?? 10
    const { rows: countRows } = await db.query(
      'SELECT COUNT(*)::int AS count FROM "playerSelection" WHERE user_id = $1',
      [req.user.id]
    )
    if (countRows[0].count >= limite) {
      return res.status(400).json({ error: `Liste déjà complète (${limite}/${limite})` })
    }
  }

  const { rows: personRows } = await db.query('SELECT date_deces FROM "personnalite" WHERE id = $1', [personId])
  const person = personRows[0]
  if (!person) return res.status(404).json({ error: 'Personne non trouvée' })
  if (person.date_deces) {
    return res.status(400).json({ error: 'Cette personne est déjà décédée, sélection refusée' })
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO "playerSelection" (user_id, person_id) VALUES ($1, $2) RETURNING id`,
      [req.user.id, personId]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Cette personne est déjà dans votre liste' })
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', authenticate, async (req, res) => {
  if (!(await checkNotFrozen(res))) return
  const { rows } = await db.query(
    'DELETE FROM "playerSelection" WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Sélection non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
