// Synchronise les personnalités (table unique "personnalite") de la base locale
// vers Neon, sans jamais toucher users / playerSelection / regles / personEdit.
//
// Prérequis : la base Neon doit avoir été migrée vers le schéma "personnalite"
// (le backend applique la migration automatiquement à son démarrage).
//
// N'insère que les données de référence validées créées hors application
// (created_by IS NULL) — jamais les entrées produites par un joueur. N'insère
// jamais un doublon : une personne déjà présente sur Neon (même nom+prénom,
// insensible à la casse) est ignorée.
//
// Usage :
//   NEON_DATABASE_URL="postgresql://...neon.tech/..." node scripts/sync-personalities-to-neon.js
//   NEON_DATABASE_URL="..." node scripts/sync-personalities-to-neon.js --apply
//
// Sans --apply : dry-run, affiche ce qui serait inséré sans rien écrire sur Neon.

const { Pool } = require('pg')

const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL || 'postgresql://dc_user:dc_password@localhost:5432/deathchallenge'
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL

if (!NEON_DATABASE_URL) {
  console.error('Erreur : variable d\'environnement NEON_DATABASE_URL manquante.')
  console.error('Exemple : NEON_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require" node scripts/sync-personalities-to-neon.js')
  process.exit(1)
}

const APPLY = process.argv.includes('--apply')

function sslFor(url) {
  return /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false }
}

const local = new Pool({ connectionString: LOCAL_DATABASE_URL, ssl: sslFor(LOCAL_DATABASE_URL) })
const neon = new Pool({ connectionString: NEON_DATABASE_URL, ssl: sslFor(NEON_DATABASE_URL) })

async function syncPersonnalites() {
  const { rows } = await local.query(
    `SELECT nom, prenom, categorie, nationalite, date_naissance, date_deces, a_verifier
     FROM "personnalite" WHERE statut = 'validee' AND created_by IS NULL`
  )

  let inserted = 0, skipped = 0
  for (const p of rows) {
    const { rows: existing } = await neon.query(
      `SELECT id FROM "personnalite"
       WHERE lower(nom) = lower($1) AND lower(COALESCE(prenom, '')) = lower(COALESCE($2, '')) AND statut = 'validee'`,
      [p.nom, p.prenom]
    )
    if (existing[0]) { skipped++; continue }

    if (APPLY) {
      await neon.query(
        `INSERT INTO "personnalite" (nom, prenom, categorie, nationalite, date_naissance, date_deces, a_verifier, statut)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'validee')`,
        [p.nom, p.prenom, p.categorie, p.nationalite, p.date_naissance, p.date_deces, p.a_verifier]
      )
    }
    inserted++
  }
  return { inserted, skipped }
}

;(async () => {
  try {
    console.log(APPLY ? 'Mode APPLY : écriture réelle sur Neon.' : 'Mode DRY-RUN : aucune écriture (relancer avec --apply pour appliquer).')
    const r = await syncPersonnalites()
    console.log(`personnalite : ${r.inserted} ${APPLY ? 'insérées' : 'à insérer'}, ${r.skipped} déjà présentes (ignorées)`)
  } catch (err) {
    console.error('Erreur pendant la synchronisation :', err.message)
    process.exitCode = 1
  } finally {
    await local.end()
    await neon.end()
  }
})()
