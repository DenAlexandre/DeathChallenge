import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import UserModal from '../components/UserModal'
import UserSelectionsModal from '../components/UserSelectionsModal'

const ROLE_LABELS = { admin: 'Administrateur', joueur: 'Joueur' }
const ROLE_BADGES = { admin: 'badge-admin', joueur: 'badge-joueur' }

export default function Users() {
  const { user: me } = useAuth()

  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(null)
  const [selectionsOf, setSelectionsOf] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false))
  }, [])

  const handleSaved = (saved, mode) => {
    if (mode === 'add') setUsers(u => [...u, saved])
    else setUsers(u => u.map(x => x.id === saved.id ? saved : x))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      setUsers(u => u.filter(x => x.id !== deleteTarget.id))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Gestion des utilisateurs</div>
          <div className="page-subtitle">Administrateurs et joueurs</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ user: null })}>
          + Ajouter un utilisateur
        </button>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Créé le</th>
                    <th>Personnalités choisies</th>
                    <th style={{ width: 120 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12, background: '#e2e8f0', color: '#475569' }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="fw-600">
                            {u.username}
                            {u.id === me?.id && (
                              <span className="text-muted text-sm"> (vous)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="text-muted text-sm">{u.email || '—'}</td>
                      <td><span className={`badge ${ROLE_BADGES[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                      <td className="text-muted text-sm">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="fw-600">{u.selection_count}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelectionsOf(u)}
                            title="Voir la sélection"
                          >🏆</button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setModal({ user: u })}
                            title="Modifier"
                          >✏️</button>
                          {u.id !== me?.id && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteTarget(u)}
                              title="Supprimer"
                              style={{ color: '#dc2626' }}
                            >🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-footer">
                <span className="table-count">
                  {users.length} utilisateur{users.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <UserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {selectionsOf && (
        <UserSelectionsModal
          user={selectionsOf}
          onClose={() => setSelectionsOf(null)}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Supprimer l'utilisateur</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-body">
                <div className="confirm-icon">⚠️</div>
                <div className="confirm-title">Supprimer cet utilisateur ?</div>
                <div className="confirm-text">
                  Le compte <strong>{deleteTarget.username}</strong> sera définitivement supprimé.
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
