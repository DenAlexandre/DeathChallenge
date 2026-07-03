import { useState } from 'react'
import api from '../api/client'
import PasswordInput from './PasswordInput'

export default function ChangePasswordModal({ onClose }) {
  const [form,    setForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [saving,  setSaving]  = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">Modifier mon mot de passe</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {success ? (
          <>
            <div className="modal-body">
              <div className="login-success">Mot de passe modifié avec succès.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onClose}>Fermer</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Mot de passe actuel *</label>
                  <PasswordInput className="form-input" value={form.currentPassword}
                    onChange={e => set('currentPassword', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Nouveau mot de passe *</label>
                  <PasswordInput className="form-input" value={form.newPassword}
                    onChange={e => set('newPassword', e.target.value)} required minLength={6} />
                </div>
                <div className="form-group">
                  <label>Confirmer le nouveau mot de passe *</label>
                  <PasswordInput className="form-input" value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)} required minLength={6} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Modifier'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
