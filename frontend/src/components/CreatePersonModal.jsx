import { useState } from 'react'
import api from '../api/client'

const CATEGORIES_SUGGESTIONS = [
  'Acteur/Actrice', 'Chanteur/Chanteuse', 'Musicien/Musicienne', 'Écrivain/Écrivaine',
  'Footballeur/Footballeuse', 'Homme/Femme politique', 'Basketteur/Basketteuse',
  'Réalisateur/Réalisatrice', 'Humoriste', 'Danseur/Danseuse', 'Scientifique',
  'Journaliste', 'Peintre/Sculpteur', 'Rugbyman/Rugbywoman', 'Cycliste',
]

export default function CreatePersonModal({ initialNom, initialPrenom, onClose, onCreated }) {
  const [form, setForm] = useState({
    nom: initialNom || '',
    prenom: initialPrenom || '',
    categorie: '',
    nationalite: '',
    annee_naissance: '',
  })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { data: created } = await api.post('/alive-persons', {
        ...form,
        annee_naissance: form.annee_naissance ? parseInt(form.annee_naissance) : null,
      })
      await api.post('/selections', { alivePersonId: created.id })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-title">Proposer une nouvelle personnalité</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
            <p className="text-muted text-sm" style={{ marginBottom: 14 }}>
              Cette personne sera ajoutée à votre sélection avec le statut "en attente" le
              temps qu'un administrateur vérifie et valide les informations.
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
                <input className="form-input" list="categorie-suggestions" value={form.categorie}
                  onChange={e => set('categorie', e.target.value)} placeholder="Ex. Acteur/Actrice" />
                <datalist id="categorie-suggestions">
                  {CATEGORIES_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>Nationalité</label>
                <input className="form-input" value={form.nationalite}
                  onChange={e => set('nationalite', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Année de naissance</label>
                <input className="form-input" type="number" value={form.annee_naissance}
                  onChange={e => set('annee_naissance', e.target.value)}
                  min="1900" max="2026" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Création...' : 'Créer et ajouter à ma liste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
