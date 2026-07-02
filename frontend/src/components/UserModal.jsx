import { useState, useEffect } from 'react'
import api from '../api/client'

export default function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user?.id

  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'joueur' })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', email: user.email || '', password: '', role: user.role || 'joueur' })
    }
  }, [user])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        const payload = { username: form.username, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        const { data } = await api.put(`/users/${user.id}`, payload)
        onSaved(data, 'edit')
      } else {
        const { data } = await api.post('/users', form)
        onSaved(data, 'add')
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Identifiant *</label>
                <input className="form-input" value={form.username}
                  onChange={e => set('username', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label>
                  {isEdit
                    ? 'Nouveau mot de passe (laisser vide pour conserver)'
                    : 'Mot de passe *'}
                </label>
                <input className="form-input" type="password" value={form.password}
                  onChange={e => set('password', e.target.value)} required={!isEdit} />
              </div>
              <div className="form-group">
                <label>Rôle *</label>
                <select className="form-select" value={form.role}
                  onChange={e => set('role', e.target.value)}>
                  <option value="joueur">Joueur</option>
                  <option value="admin">Administrateur — accès complet</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
