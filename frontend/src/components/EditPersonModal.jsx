import { useState } from 'react'
import api from '../api/client'
import { CATEGORIES_SUGGESTIONS, NATIONALITES } from '../lib/personOptions'
import { today } from '../lib/format'

export default function EditPersonModal({ person, validationRequired = true, onClose, onProposed }) {
  const [form, setForm] = useState({
    nom: person.nom || '',
    prenom: person.prenom || '',
    categorie: person.categorie || '',
    nationalite: person.nationalite || '',
    date_naissance: person.date_naissance || '',
  })
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [applied,   setApplied]   = useState(false)
  const [nationaliteAutre, setNationaliteAutre] = useState(
    Boolean(person.nationalite) && !NATIONALITES.includes(person.nationalite)
  )

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleNationaliteSelect = v => {
    if (v === 'Autre') {
      setNationaliteAutre(true)
      set('nationalite', '')
    } else {
      setNationaliteAutre(false)
      set('nationalite', v)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { data } = await api.post(`/personnalites/${person.id}/propose-edit`, {
        nom: form.nom,
        prenom: form.prenom,
        categorie: form.categorie,
        nationalite: form.nationalite,
        date_naissance: form.date_naissance || null,
      })
      setApplied(Boolean(data.applied))
      onProposed()
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">Modifier {person.prenom} {person.nom}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {submitted ? (
          <>
            <div className="modal-body">
              <div className="login-success">
                {applied
                  ? '✅ Modification appliquée immédiatement.'
                  : "✅ Modification envoyée. Un administrateur doit la valider avant qu'elle soit prise en compte."}
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
                  ? "Cette modification devra être validée par un administrateur avant d'être appliquée."
                  : 'La validation administrateur est désactivée : cette modification sera appliquée immédiatement.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-input" value={form.nom}
                    onChange={e => set('nom', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input className="form-input" value={form.prenom}
                    onChange={e => set('prenom', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <input className="form-input" list="categorie-suggestions-edit" value={form.categorie}
                    onChange={e => set('categorie', e.target.value)} placeholder="Ex. Acteur/Actrice" />
                  <datalist id="categorie-suggestions-edit">
                    {CATEGORIES_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Nationalité</label>
                  <select className="form-select" value={nationaliteAutre ? 'Autre' : form.nationalite}
                    onChange={e => handleNationaliteSelect(e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {NATIONALITES.map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="Autre">Autre...</option>
                  </select>
                  {nationaliteAutre && (
                    <input className="form-input" style={{ marginTop: 8 }} value={form.nationalite}
                      onChange={e => set('nationalite', e.target.value)}
                      placeholder="Préciser la nationalité" autoFocus />
                  )}
                </div>
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input className="form-input" type="date" value={form.date_naissance}
                    onChange={e => set('date_naissance', e.target.value)}
                    min="1900-01-01" max={today()} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Envoi...' : 'Proposer la modification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
