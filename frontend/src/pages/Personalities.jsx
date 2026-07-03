import { useState, useEffect } from 'react'
import api from '../api/client'
import AdminPersonModal from '../components/AdminPersonModal'
import { formatDate } from '../lib/format'

const STATUT_LABELS = { validee: 'Validée', en_attente: 'En attente' }
const STATUT_BADGES = { validee: 'badge-alive', en_attente: 'badge-en-attente' }

const PAGE_SIZE = 20

function PersonTable({ title, subtitle, persons, showDeath, setEditTarget, setDeleteTarget }) {
  const [query, setQuery] = useState('')
  const [page,  setPage]  = useState(1)

  const filtered = persons.filter(p => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return `${p.nom} ${p.prenom}`.toLowerCase().includes(q)
  })

  // Ramène sur une page valide si le filtre réduit le nombre de résultats.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleQueryChange = (value) => {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: '16px 20px 0' }}>
        <div className="fw-600">{title}</div>
        <div className="text-muted text-sm">{subtitle}</div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <input
          className="form-input"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Rechercher par nom ou prénom..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-text">Aucun résultat.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Nationalité</th>
                <th>Naissance</th>
                {showDeath && <th>Décès</th>}
                <th>Statut</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(p => (
                <tr key={p.id}>
                  <td className="fw-600">
                    {p.prenom} {p.nom}
                    {p.sans_points && (
                      <span className="text-muted text-sm" title="Ne rapporte jamais de points"> 🚫pts</span>
                    )}
                  </td>
                  <td><span className="badge badge-cat">{p.categorie || '—'}</span></td>
                  <td className="text-muted text-sm">{p.nationalite || '—'}</td>
                  <td className="text-muted text-sm">{formatDate(p.date_naissance)}</td>
                  {showDeath && <td className="text-muted text-sm">{formatDate(p.date_deces)}</td>}
                  <td><span className={`badge ${STATUT_BADGES[p.statut] || ''}`}>{STATUT_LABELS[p.statut] || p.statut}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="btn btn-ghost btn-sm" title="Modifier"
                        onClick={() => setEditTarget(p)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" title="Supprimer"
                        style={{ color: '#dc2626' }}
                        onClick={() => setDeleteTarget(p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="table-count">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {persons.length}
            </span>
            {pageCount > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}>
                  ← Précédent
                </button>
                <span className="table-count">Page {currentPage} / {pageCount}</span>
                <button className="btn btn-secondary btn-sm"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}>
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Personalities() {
  const [persons,      setPersons]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const load = () => {
    setLoading(true)
    return api.get('/personnalites/all').then(({ data }) => setPersons(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSaved = (saved) => {
    setPersons(list => {
      const exists = list.some(p => p.id === saved.id)
      if (exists) return list.map(p => p.id === saved.id ? { ...p, ...saved } : p)
      return [...list, { selections: 0, ...saved }]
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/personnalites/${deleteTarget.id}`)
      setPersons(list => list.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const alive = persons.filter(p => !p.date_deces)
  const dead = persons.filter(p => p.date_deces)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Personnalités</div>
          <div className="page-subtitle">Toutes les personnalités vivantes et décédées de la base</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Ajouter une personnalité
        </button>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading"><div className="spinner" /> Chargement...</div>
        ) : (
          <>
            <PersonTable
              title="Vivantes"
              subtitle="Personnalités sélectionnables par les joueurs"
              persons={alive}
              setEditTarget={setEditTarget}
              setDeleteTarget={setDeleteTarget}
            />
            <PersonTable
              title="Décédées"
              subtitle="Décès enregistrés"
              persons={dead}
              showDeath
              setEditTarget={setEditTarget}
              setDeleteTarget={setDeleteTarget}
            />
          </>
        )}
      </div>

      {showCreate && (
        <AdminPersonModal
          person={null}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {editTarget && (
        <AdminPersonModal
          person={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Supprimer cette personnalité</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-body">
                <div className="confirm-icon">⚠️</div>
                <div className="confirm-title">
                  Supprimer {deleteTarget.prenom} {deleteTarget.nom} ?
                </div>
                <div className="confirm-text">
                  Cette action est irréversible.
                  {deleteTarget.selections > 0 && (
                    <> <strong>{deleteTarget.selections} joueur{deleteTarget.selections > 1 ? 's ont' : ' a'}</strong> cette
                    personne dans sa sélection — leur historique de pari (et points éventuels) sera perdu.</>
                  )}
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
