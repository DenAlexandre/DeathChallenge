// Script ponctuel générique : pousse un compte joueur et sa sélection de
// personnalités depuis la base locale vers Neon. Dry-run par défaut, --apply pour écrire.
// Usage : NEON_DATABASE_URL="..." node scripts/push-user-to-neon.js <username> [--apply]

const { Pool } = require('pg')

const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL || 'postgresql://dc_user:dc_password@localhost:5432/deathchallenge'
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL
const USERNAME = process.argv[2]

if (!NEON_DATABASE_URL) {
  console.error('Erreur : variable d\'environnement NEON_DATABASE_URL manquante.')
  process.exit(1)
}
if (!USERNAME || USERNAME.startsWith('--')) {
  console.error('Usage : node scripts/push-user-to-neon.js <username> [--apply]')
  process.exit(1)
}

const APPLY = process.argv.includes('--apply')

function sslFor(url) {
  return /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false }
}

const local = new Pool({ connectionString: LOCAL_DATABASE_URL, ssl: sslFor(LOCAL_DATABASE_URL) })
const neon = new Pool({ connectionString: NEON_DATABASE_URL, ssl: sslFor(NEON_DATABASE_URL) })

;(async () => {
  try {
    console.log(APPLY ? 'Mode APPLY : écriture réelle sur Neon.' : 'Mode DRY-RUN : aucune écriture (relancer avec --apply pour appliquer).')

    const { rows: userRows } = await local.query(
      `SELECT username, email, password_hash, role FROM users WHERE username = $1`, [USERNAME]
    )
    const user = userRows[0]
    if (!user) throw new Error(`Utilisateur "${USERNAME}" introuvable en local`)

    const { rows: selRows } = await local.query(
      `SELECT p.nom, p.prenom, ps.points
       FROM "playerSelection" ps
       JOIN "personnalite" p ON p.id = ps.person_id
       JOIN users u ON u.id = ps.user_id
       WHERE u.username = $1`, [USERNAME]
    )
    console.log(`Sélection locale de ${USERNAME} : ${selRows.length} personnalité(s)`)

    const { rows: existingUser } = await neon.query('SELECT id FROM users WHERE username = $1', [user.username])
    let neonUserId
    if (existingUser[0]) {
      neonUserId = existingUser[0].id
      console.log(`Utilisateur "${USERNAME}" déjà présent sur Neon (id ${neonUserId}) — pas de recréation.`)
    } else if (APPLY) {
      const { rows } = await neon.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        [user.username, user.email, user.password_hash, user.role]
      )
      neonUserId = rows[0].id
      console.log(`Utilisateur "${USERNAME}" créé sur Neon (id ${neonUserId}).`)
    } else {
      console.log(`Utilisateur "${USERNAME}" serait créé sur Neon.`)
    }

    let inserted = 0, skipped = 0, notFound = 0
    for (const sel of selRows) {
      const { rows: personRows } = await neon.query(
        `SELECT id FROM "personnalite"
         WHERE lower(nom) = lower($1) AND lower(COALESCE(prenom, '')) = lower(COALESCE($2, '')) AND statut = 'validee'`,
        [sel.nom, sel.prenom]
      )
      if (!personRows[0]) { notFound++; console.log(`  introuvable sur Neon : ${sel.prenom} ${sel.nom}`); continue }
      const personId = personRows[0].id

      if (!APPLY) { inserted++; continue }

      const { rows: existingSel } = await neon.query(
        `SELECT id FROM "playerSelection" WHERE user_id = $1 AND person_id = $2`,
        [neonUserId, personId]
      )
      if (existingSel[0]) { skipped++; continue }

      await neon.query(
        `INSERT INTO "playerSelection" (user_id, person_id, points) VALUES ($1, $2, $3)`,
        [neonUserId, personId, sel.points]
      )
      inserted++
    }

    console.log(`Sélections : ${inserted} ${APPLY ? 'insérées' : 'à insérer'}, ${skipped} déjà présentes, ${notFound} introuvables sur Neon`)
  } catch (err) {
    console.error('Erreur pendant la synchronisation :', err.message)
    process.exitCode = 1
  } finally {
    await local.end()
    await neon.end()
  }
})()
