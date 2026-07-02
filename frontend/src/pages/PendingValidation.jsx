import { useState, useEffect } from 'react'
import api from '../api/client'

function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatBirth(p) {
  return formatDate(p.date_naissance)
}

function formatAge(dateNaissance, referenceDate) {
  if (!dateNaissance) return '—'
  const birth = new Date(dateNaissance)
  const ref = referenceDate ? new Date(referenceDate) : new Date()
  let age = ref.getFullYear() - birth.getFullYear()
  const monthDiff = ref.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) age--
  return `${age} ans`
}

function PendingSection({ title, subtitle, emptyText, endpoint, showDeath }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)

  const load = () => {
    setLoading(true)
    return api.get(`${endpoint}/pending`).then(({ data }) => setPending(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id) => {
    setBusyId(id)
    try {
      await api.put(`${endpoint}/${id}/validate`)
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    setBusyId(id)
    try {
      await api.delete(`${endpoint}/${id}`)
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: '16px 20px 0' }}>
        <div className="fw-600">{title}</div>
        <div className="text-muted text-sm">{subtitle}</div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Chargement...</div>
      ) : pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-text">{emptyText}</div>
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
                <th>Âge</th>
                {showDeath && <th>Décès</th>}
                <th>Proposé par</th>
                <th style={{ width: 170 }}></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(p => (
                <tr key={p.id}>
                  <td className="fw-600">{p.prenom} {p.nom}</td>
                  <td><span className="badge badge-cat">{p.categorie || '—'}</span></td>
                  <td className="text-muted text-sm">{p.nationalite || '—'}</td>
                  <td className="text-muted text-sm">{formatBirth(p)}</td>
                  <td className="text-muted text-sm">{formatAge(p.date_naissance, showDeath ? p.date_deces : null)}</td>
                  {showDeath && <td className="text-muted text-sm">{formatDate(p.date_deces)}</td>}
                  <td className="text-muted text-sm">{p.proposed_by || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" disabled={busyId === p.id}
                        onClick={() => handleValidate(p.id)}>
                        Valider
                      </button>
                      <button className="btn btn-ghost btn-sm" disabled={busyId === p.id}
                        style={{ color: '#dc2626' }}
                        onClick={() => handleReject(p.id)}>
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function PendingValidation() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Validation des propositions</div>
          <div className="page-subtitle">Personnalités et décès proposés par les joueurs, en attente de vérification</div>
        </div>
      </div>

      <div className="page-body">
        <PendingSection
          title="Personnalités vivantes"
          subtitle="Nouvelles entrées proposées pour une sélection"
          emptyText="Aucune proposition en attente pour le moment."
          endpoint="/alive-persons"
        />
        <PendingSection
          title="Décès signalés"
          subtitle="Décès absents de la base, signalés par des joueurs"
          emptyText="Aucun décès en attente de vérification."
          endpoint="/death-persons"
          showDeath
        />
      </div>
    </>
  )
}
