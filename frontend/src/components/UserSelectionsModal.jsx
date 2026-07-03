import { useState, useEffect } from 'react'
import api from '../api/client'

export default function UserSelectionsModal({ user, onClose }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/users/${user.id}/selections`)
      .then(({ data }) => setRows(data))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div className="modal-title">Sélection de {user.username}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">Aucune personnalité sélectionnée.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Personnalité</th>
                    <th>Catégorie</th>
                    <th>Statut</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td className="fw-600">{r.prenom} {r.nom}</td>
                      <td className="text-muted text-sm">{r.categorie || '—'}</td>
                      <td>
                        <span className={`badge ${r.deja_decede ? 'badge-deceased' : 'badge-alive'}`}>
                          {r.deja_decede ? 'Décédé(e)' : 'Vivant(e)'}
                        </span>
                      </td>
                      <td className="fw-600">{r.points ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer">
                <span className="table-count">
                  {rows.length} personnalité{rows.length > 1 ? 's' : ''} sélectionnée{rows.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
