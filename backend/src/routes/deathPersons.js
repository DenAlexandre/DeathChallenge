const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

function calculateAge(dateNaissance, anneeNaissance, dateDeces) {
  const death = new Date(dateDeces)
  if (dateNaissance) {
    const birth = new Date(dateNaissance)
    let age = death.getFullYear() - birth.getFullYear()
    const monthDiff = death.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) age--
    return age
  }
  if (anneeNaissance) return death.getFullYear() - anneeNaissance
  return null
}

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

  const { rows } = await db.query(
    `INSERT INTO "deathPerson" (nom, prenom, categorie, nationalite, date_naissance, date_deces, statut, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'en_attente', $7)
     RETURNING id, nom, prenom, categorie, date_naissance, date_deces, nationalite, statut`,
    [nom.trim(), prenom.trim(), categorie || null, nationalite || null, date_naissance || null, date_deces, req.user.id]
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
    const { rows: personRows } = await db.query(
      `SELECT date_naissance, annee_naissance FROM "alivePerson" WHERE id = $1`,
      [deathPerson.alive_person_id]
    )
    const { rows: selectionRows } = await db.query(
      `SELECT 1 FROM "playerSelection" WHERE alive_person_id = $1 LIMIT 1`,
      [deathPerson.alive_person_id]
    )

    if (selectionRows[0] && personRows[0]) {
      const age = calculateAge(personRows[0].date_naissance, personRows[0].annee_naissance, deathPerson.date_deces)
      const points = age === null ? 0 : Math.max(0, 100 - age)
      await db.query(`UPDATE "playerSelection" SET points = $1 WHERE alive_person_id = $2`, [points, deathPerson.alive_person_id])
    }

    // Un joueur a cette personne dans sa sélection : on la marque décédée au lieu de
    // la supprimer, pour ne pas perdre (cascade FK) son historique de pari (et ses points).
    if (selectionRows[0]) {
      await db.query(`UPDATE "alivePerson" SET statut = 'decedee' WHERE id = $1`, [deathPerson.alive_person_id])
    } else {
      await db.query(`DELETE FROM "alivePerson" WHERE id = $1`, [deathPerson.alive_person_id])
    }
  }

  res.json({ id: deathPerson.id, nom: deathPerson.nom, prenom: deathPerson.prenom, statut: deathPerson.statut })
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { rows } = await db.query('DELETE FROM "deathPerson" WHERE id = $1 RETURNING id', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Personne non trouvée' })
  res.json({ message: 'Supprimé' })
})

module.exports = router
