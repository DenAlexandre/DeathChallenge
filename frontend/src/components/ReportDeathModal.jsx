import { useState } from 'react'
import api from '../api/client'

export default function ReportDeathModal({ person, validationRequired = true, onClose, onReported }) {
  const [dateDeces, setDateDeces] = useState('')
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post(`/alive-persons/${person.id}/report-death`, { date_deces: dateDeces })
      onReported()
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du signalement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">Signaler le décès de {person.prenom} {person.nom}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {submitted ? (
          <>
            <div className="modal-body">
              <div className="login-success">
                {validationRequired
                  ? "✅ Signalement envoyé. Un administrateur doit valider ce décès avant qu'il soit pris en compte."
                  : '✅ Décès enregistré et pris en compte immédiatement.'}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={onClose}>Fermer</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

              <p className="text-muted text-sm" style={{ margin: '0 0 14px' }}>
                {validationRequired
                  ? 'Ce décès sera enregistré avec le statut "en attente" le temps qu\'un administrateur vérifie et valide l\'information.'
                  : "La validation administrateur est désactivée : ce décès sera pris en compte immédiatement."}
              </p>

              <div className="form-group">
                <label>Date de décès *</label>
                <input className="form-input" type="date" value={dateDeces}
                  onChange={e => setDateDeces(e.target.value)}
                  min="1900-01-01" max="2026-07-02" required autoFocus />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Signalement...' : 'Signaler le décès'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
