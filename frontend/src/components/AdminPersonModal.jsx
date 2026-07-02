import { useState } from 'react'
import api from '../api/client'

const CATEGORIES_SUGGESTIONS = [
  'Acteur/Actrice', 'Chanteur/Chanteuse', 'Musicien/Musicienne', 'Écrivain/Écrivaine',
  'Footballeur/Footballeuse', 'Homme/Femme politique', 'Basketteur/Basketteuse',
  'Réalisateur/Réalisatrice', 'Humoriste', 'Danseur/Danseuse', 'Scientifique',
  'Journaliste', 'Peintre/Sculpteur', 'Rugbyman/Rugbywoman', 'Cycliste',
]

const NATIONALITES = [
  'Allemand(e)', 'Américain(e)', 'Anglais(e)', 'Argentin(e)', 'Autrichien(ne)',
  'Belge', 'Canadien(ne)', 'Espagnol(e)', 'Français(e)', 'Grec(que)', 'Indien(ne)',
  'Irlandais(e)', 'Italien(ne)', 'Japonais(e)', 'Néerlandais(e)', 'Polonais(e)',
  'Portugais(e)', 'Russe', 'Sénégalais(e)', 'Sud-Africain(e)', 'Suisse', 'Turc(que)',
]

// type: 'alive' | 'dead' — édition directe par un admin, appliquée immédiatement
// (pas de file de validation : l'admin a déjà l'autorité de validation).
export default function AdminPersonModal({ person, type, onClose, onSaved }) {
  const isDead = type === 'dead'
  const [form, setForm] = useState({
    nom: person.nom || '',
    prenom: person.prenom || '',
    categorie: person.categorie || '',
    nationalite: person.nationalite || '',
    date_naissance: person.date_naissance || '',
    date_deces: person.date_deces || '',
  })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)
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
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        categorie: form.categorie,
        nationalite: form.nationalite,
        date_naissance: form.date_naissance || null,
      }
      if (isDead) payload.date_deces = form.date_deces
      const endpoint = isDead ? `/death-persons/${person.id}` : `/alive-persons/${person.id}`
      const { data } = await api.put(endpoint, payload)
      onSaved(data)
      onClose()
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

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
                <input className="form-input" list="categorie-suggestions-admin" value={form.categorie}
                  onChange={e => set('categorie', e.target.value)} placeholder="Ex. Acteur/Actrice" />
                <datalist id="categorie-suggestions-admin">
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
                  min="1900-01-01" max="2026-07-03" />
              </div>
              {isDead && (
                <div className="form-group">
                  <label>Date de décès *</label>
                  <input className="form-input" type="date" value={form.date_deces}
                    onChange={e => set('date_deces', e.target.value)}
                    min="1900-01-01" max="2026-07-03" required />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
