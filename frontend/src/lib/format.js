// "YYYY-MM-DD" -> "DD/MM/YYYY"
export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Âge révolu à une date de référence (aujourd'hui par défaut, ou la date de
// décès pour un âge au décès). null si la date de naissance est inconnue.
export function calculateAge(dateNaissance, referenceDate) {
  if (!dateNaissance) return null
  const birth = new Date(dateNaissance)
  const ref = referenceDate ? new Date(referenceDate) : new Date()
  let age = ref.getFullYear() - birth.getFullYear()
  const monthDiff = ref.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) age--
  return age
}

export function formatAge(dateNaissance, referenceDate) {
  const age = calculateAge(dateNaissance, referenceDate)
  return age === null ? '—' : `${age} ans`
}

// Borne max des champs date (une naissance ou un décès ne peut pas être
// dans le futur) — calculée à l'exécution, jamais codée en dur.
export function today() {
  return new Date().toISOString().slice(0, 10)
}
