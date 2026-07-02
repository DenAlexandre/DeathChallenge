import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import PersonModal from '../components/PersonModal'

function calcAge(birthStr, toDateStr) {
  if (!birthStr) return null
  const born = new Date(birthStr)
  const to   = toDateStr ? new Date(toDateStr) : new Date()
  let age = to.getFullYear() - born.getFullYear()
  const m = to.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && to.getDate() < born.getDate())) age--
  return age >= 0 ? age : null
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}

function buildSlug(prenom, nom) {
  const normalize = s =>
    s.toLowerCase()
     .normalize('NFD').replace(/[̀-ͯ]/g, '')
     .replace(/[^a-z0-9\s-]/g, '')
     .trim()
     .replace(/\s+/g, '-')
  return `${normalize(prenom)}-${normalize(nom)}`
}

export default function Persons() {
  const { user } = useAuth()
  const canEdit   = user?.role === 'admin' || user?.role === 'editor'
  const canDelete = user?.role === 'admin'

  const [persons,      setPersons]      = useState([])
  const [stats,        setStats]        = useState({ total: 0, alive: 0, deceased: 0 })
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterCat,    setFilterCat]    = useState('')
  const [categories,   setCategories]   = useState([])
  const [modal,        setModal]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/persons/stats').then(({ data }) => setStats(data))
  }, [])

  const fetchPersons = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)    params.search    = search
      if (filterCat) params.categorie = filterCat
      const { data } = await api.get('/persons', { params })
      setPersons(data)
      const cats = [...new Set(data.map(p => p.categorie).filter(Boolean))].sort()
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }, [search, filterCat])

  useEffect(() => {
    const t = setTimeout(fetchPersons, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchPersons, search])

  const handleSaved = (saved, mode) => {
    api.get('/persons/stats').then(({ data }) => setStats(data))
    if (mode === 'add') {
      setPersons(p => [...p, saved].sort((a, b) => a.nom.localeCompare(b.nom)))
    } else {
      setPersons(p => p.map(x => x.id === saved.id ? saved : x))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/persons/${deleteTarget.id}`)
      setPersons(p => p.filter(x => x.id !== deleteTarget.id))
      api.get('/persons/stats').then(({ data }) => setStats(data))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const resetFilters = () => { setSearch(''); setFilterCat('') }
  const hasFilters = search || filterCat

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Personnes suivies</div>
          <div className="page-subtitle">Liste des personnes connues</div>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setModal({ person: null })}>
            + Ajouter
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total suivi</div>
          </div>
          <div className="stat-card alive">
            <div className="stat-value">{stats.alive}</div>
            <div className="stat-label">Encore en vie</div>
          </div>
          <div className="stat-card deceased">
            <div className="stat-value">{stats.deceased}</div>
            <div className="stat-label">Décédées</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div className="search-toolbar">
              <div className="search-group" style={{ flex: 1, minWidth: 200 }}>
                <div className="search-label">Recherche</div>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="Nom, prénom..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {categories.length > 0 && (
                <div className="search-group">
                  <div className="search-label">Catégorie</div>
                  <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">Toutes</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {hasFilters && (
                <div className="search-group" style={{ justifyContent: 'flex-end' }}>
                  <div className="search-label">&nbsp;</div>
                  <button className="btn btn-secondary" onClick={resetFilters}>Réinitialiser</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : persons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">Aucune personne trouvée</div>
              <div className="empty-text">
                {hasFilters
                  ? 'Aucun résultat pour ces filtres.'
                  : canEdit ? 'Commencez par ajouter des personnes.' : 'Aucune personne enregistrée.'}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom / Prénom</th>
                    <th>Naissance</th>
                    <th>Âge</th>
                    <th>Nationalité</th>
                    <th>Catégorie</th>
                    <th>Statut</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map(p => {
                    const ageAt = p.is_alive ? null : p.deceased_at
                    const age   = calcAge(p.date_naissance, ageAt)
                    const jsm   = `https://www.jesuismort.com/tombe/${buildSlug(p.prenom, p.nom)}`
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="fw-600">{p.prenom} {p.nom}</div>
                          {p.description && (
                            <div className="text-muted text-sm"
                              style={{ marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.description}
                            </div>
                          )}
                        </td>
                        <td className="text-muted text-sm">{fmtDate(p.date_naissance)}</td>
                        <td className="text-muted text-sm">
                          {age !== null ? `${age} ans${!p.is_alive ? '*' : ''}` : '—'}
                        </td>
                        <td className="text-muted text-sm">{p.nationalite || '—'}</td>
                        <td>
                          {p.categorie
                            ? <span className="badge badge-cat">{p.categorie}</span>
                            : <span className="text-muted text-sm">—</span>}
                        </td>
                        <td>
                          {p.is_alive
                            ? <span className="badge badge-alive">● Vivant</span>
                            : <span className="badge badge-deceased">
                                ✕ Décédé{p.deceased_at ? ` (${fmtDate(p.deceased_at)})` : ''}
                              </span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <a
                              href={jsm}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ghost btn-sm"
                              title="Vérifier sur JeSuisMort.com"
                              style={{ textDecoration: 'none' }}
                            >🪦</a>
                            {canEdit && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setModal({ person: p })}
                                title="Modifier"
                              >✏️</button>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDeleteTarget(p)}
                                title="Supprimer"
                                style={{ color: '#dc2626' }}
                              >🗑️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="table-footer">
                <span className="table-count">
                  {persons.length} personne{persons.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <PersonModal
          person={modal.person}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Confirmer la suppression</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-body">
                <div className="confirm-icon">⚠️</div>
                <div className="confirm-title">Supprimer cette personne ?</div>
                <div className="confirm-text">
                  <strong>{deleteTarget.prenom} {deleteTarget.nom}</strong> sera définitivement supprimée.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
