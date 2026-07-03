const express = require('express')
const db = require('../db')
const { authenticate, requireRole } = require('../middleware/auth')

const router = express.Router()

// Ordre compatible avec les clés étrangères (parents avant enfants) : le
// schéma applicatif est fixe et documenté dans CLAUDE.md, pas besoin de tri
// dynamique par dépendances.
const TABLES = ['users', 'personnalite', 'personEdit', 'playerSelection', 'regles']

const TYPE_OVERRIDES = {
  'character varying': c => `VARCHAR${c.character_maximum_length ? `(${c.character_maximum_length})` : ''}`,
  'timestamp with time zone': () => 'TIMESTAMPTZ',
}

function formatValue(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (v instanceof Date) return `'${v.toISOString()}'`
  return `'${String(v).replace(/'/g, "''")}'`
}

async function describeTable(table) {
  const { rows: columns } = await db.query(
    `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  )

  const { rows: constraints } = await db.query(
    `SELECT conname, contype, pg_get_constraintdef(c.oid, true) AS def
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     WHERE t.relname = $1 AND t.relnamespace = 'public'::regnamespace`,
    [table]
  )

  const colLines = columns.map(c => {
    const isSerial = c.column_default?.startsWith('nextval(')
    // SERIAL crée sa propre séquence + DEFAULT : indispensable pour que les
    // futurs INSERT de l'appli (qui ne fournissent pas d'id) fonctionnent
    // après restauration, sans quoi la colonne id resterait NOT NULL sans
    // valeur par défaut.
    const override = TYPE_OVERRIDES[c.data_type]
    const type = isSerial ? (c.data_type === 'bigint' ? 'BIGSERIAL' : 'SERIAL') : (override ? override(c) : c.data_type).toUpperCase()
    let line = `  "${c.column_name}" ${type}`
    if (c.is_nullable === 'NO' && !isSerial) line += ' NOT NULL'
    if (c.column_default && !isSerial) line += ` DEFAULT ${c.column_default}`
    return line
  })

  const pk     = constraints.find(c => c.contype === 'p')
  const others = constraints.filter(c => c.contype === 'u' || c.contype === 'c')
  const fks    = constraints.filter(c => c.contype === 'f')

  const lines = [...colLines]
  if (pk) lines.push(`  CONSTRAINT "${pk.conname}" ${pk.def}`)
  for (const c of others) lines.push(`  CONSTRAINT "${c.conname}" ${c.def}`)

  const createTable = `CREATE TABLE IF NOT EXISTS "${table}" (\n${lines.join(',\n')}\n);`

  const fkStatements = fks.map(fk => (
    `DO $$ BEGIN\n  ALTER TABLE "${table}" ADD CONSTRAINT "${fk.conname}" ${fk.def};\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;`
  ))

  const serialCol = columns.find(c => c.column_default?.startsWith('nextval('))
  const sequenceFixup = serialCol
    ? `SELECT setval(pg_get_serial_sequence('"${table}"', '${serialCol.column_name}'), COALESCE((SELECT MAX("${serialCol.column_name}") FROM "${table}"), 1), true);`
    : null

  return { createTable, fkStatements, sequenceFixup }
}

async function buildInserts(table) {
  const { rows } = await db.query(`SELECT * FROM "${table}" ORDER BY 1`)
  if (rows.length === 0) return `-- (table "${table}" vide)`

  const columns = Object.keys(rows[0])
  const values = rows.map(r => `  (${columns.map(c => formatValue(r[c])).join(', ')})`).join(',\n')
  return `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES\n${values};`
}

// Export SQL complet (schéma + données) reconstruit dynamiquement depuis le
// catalogue Postgres (information_schema / pg_constraint) : pg_dump n'est pas
// disponible sur l'hébergeur du backend, donc pas d'appel à un binaire externe.
router.get('/sql', authenticate, requireRole('admin'), async (req, res) => {
  const parts = [`-- Death Challenge — export SQL du ${new Date().toISOString()}\n`, 'BEGIN;\n']

  const perTable = []
  for (const table of TABLES) {
    perTable.push(await describeTable(table))
  }

  perTable.forEach((t, i) => parts.push(`-- Structure : ${TABLES[i]}\n${t.createTable}`))

  for (const table of TABLES) {
    parts.push(`\n-- Données : ${table}\n${await buildInserts(table)}`)
  }

  const fkStatements = perTable.flatMap(t => t.fkStatements)
  if (fkStatements.length) parts.push(`\n-- Clés étrangères\n${fkStatements.join('\n')}`)

  const sequenceFixups = perTable.map(t => t.sequenceFixup).filter(Boolean)
  if (sequenceFixups.length) parts.push(`\n-- Séquences\n${sequenceFixups.join('\n')}`)

  parts.push('\nCOMMIT;\n')

  const sql = parts.join('\n')
  const filename = `deathchallenge-export-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`

  res.setHeader('Content-Type', 'application/sql; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
  res.send(sql)
})

module.exports = router
