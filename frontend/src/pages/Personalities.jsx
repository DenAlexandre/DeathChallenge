import { useState, useEffect } from 'react'
import api from '../api/client'
import AdminPersonModal from '../components/AdminPersonModal'

function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const STATUT_LABELS = { validee: 'Validée', en_attente: 'En attente', decedee: 'Décédée' }
const STATUT_BADGES = { validee: 'badge-alive', en_attente: 'badge-en-attente', decedee: 'badge-deceased' }

function PersonTable({ title, subtitle, endpoint, type, showDeath, editTarget, setEditTarget }) {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')

  const load = () => {
    setLoading(true)
    return api.get(`${endpoint}/all`).then(({ data }) => setPersons(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSaved = (updated) => {
    setPersons(list => list.map(p => p.id === updated.id ? updated : p))
  }

  const filtered = persons.filter(p => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return `${p.nom} ${p.prenom}`.toLowerCase().includes(q)
  })

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
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou prénom..."
        />
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Chargement...</div>
      ) : filtered.length === 0 ? (
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
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="fw-600">{p.prenom} {p.nom}</td>
                  <td><span className="badge badge-cat">{p.categorie || '—'}</span></td>
                  <td className="text-muted text-sm">{p.nationalite || '—'}</td>
                  <td className="text-muted text-sm">{formatDate(p.date_naissance)}</td>
                  {showDeath && <td className="text-muted text-sm">{formatDate(p.date_deces)}</td>}
                  <td><span className={`badge ${STATUT_BADGES[p.statut] || ''}`}>{STATUT_LABELS[p.statut] || p.statut}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" title="Modifier"
                      onClick={() => setEditTarget({ person: p, type, onSaved: handleSaved })}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="table-count">{filtered.length} / {persons.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Personalities() {
  const [editTarget, setEditTarget] = useState(null)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Personnalités</div>
          <div className="page-subtitle">Toutes les personnalités vivantes et décédées de la base</div>
        </div>
      </div>

      <div className="page-body">
        <PersonTable
          title="Vivantes"
          subtitle="Personnalités actuellement en base côté joueurs"
          endpoint="/alive-persons"
          type="alive"
          editTarget={editTarget}
          setEditTarget={setEditTarget}
        />
        <PersonTable
          title="Décédées"
          subtitle="Décès enregistrés"
          endpoint="/death-persons"
          type="dead"
          showDeath
          editTarget={editTarget}
          setEditTarget={setEditTarget}
        />
      </div>

      {editTarget && (
        <AdminPersonModal
          person={editTarget.person}
          type={editTarget.type}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => editTarget.onSaved(updated)}
        />
      )}
    </>
  )
}
