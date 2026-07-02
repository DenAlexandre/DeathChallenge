import { useState, useEffect } from 'react'
import api from '../api/client'

export default function PendingValidation() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)

  const load = () => {
    setLoading(true)
    return api.get('/alive-persons/pending').then(({ data }) => setPending(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id) => {
    setBusyId(id)
    try {
      await api.put(`/alive-persons/${id}/validate`)
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    setBusyId(id)
    try {
      await api.delete(`/alive-persons/${id}`)
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Validation des propositions</div>
          <div className="page-subtitle">Personnalités proposées par les joueurs, en attente de vérification</div>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : pending.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Rien à valider</div>
              <div className="empty-text">Aucune proposition en attente pour le moment.</div>
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
                      <td className="text-muted text-sm">{p.annee_naissance || '—'}</td>
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
      </div>
    </>
  )
}
