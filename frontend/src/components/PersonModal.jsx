import { useState, useEffect } from 'react'
import api from '../api/client'

const CATEGORIES = [
  'Acteur/Actrice', 'Chanteur/Chanteuse', 'Sportif/Sportive',
  'Politique', 'Scientifique', 'Entrepreneur', 'Écrivain', 'Artiste', 'Autre',
]

export default function PersonModal({ person, onClose, onSaved }) {
  const isEdit = !!person?.id

  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '', nationalite: '',
    categorie: '', description: '', is_alive: true, deceased_at: '',
  })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (person) {
      setForm({
        nom:            person.nom            || '',
        prenom:         person.prenom         || '',
        date_naissance: person.date_naissance ? person.date_naissance.split('T')[0] : '',
        nationalite:    person.nationalite    || '',
        categorie:      person.categorie      || '',
        description:    person.description    || '',
        is_alive:       person.is_alive !== false,
        deceased_at:    person.deceased_at ? person.deceased_at.split('T')[0] : '',
      })
    }
  }, [person])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        date_naissance: form.date_naissance || null,
        deceased_at:    form.is_alive ? null : (form.deceased_at || null),
      }
      if (isEdit) {
        const { data } = await api.put(`/persons/${person.id}`, payload)
        onSaved(data, 'edit')
      } else {
        const { data } = await api.post('/persons', payload)
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
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? 'Modifier la personne' : 'Ajouter une personne'}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Prénom *</label>
                <input className="form-input" value={form.prenom}
                  onChange={e => set('prenom', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input className="form-input" value={form.nom}
                  onChange={e => set('nom', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Date de naissance</label>
                <input className="form-input" type="date" value={form.date_naissance}
                  onChange={e => set('date_naissance', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nationalité</label>
                <input className="form-input" value={form.nationalite}
                  onChange={e => set('nationalite', e.target.value)} placeholder="Ex : Française" />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select className="form-select" value={form.categorie}
                  onChange={e => set('categorie', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end', paddingBottom: 4 }}>
                <label className="form-check">
                  <input type="checkbox" checked={form.is_alive}
                    onChange={e => set('is_alive', e.target.checked)} />
                  <span>Personne encore en vie</span>
                </label>
              </div>
              {!form.is_alive && (
                <div className="form-group">
                  <label>Date de décès</label>
                  <input className="form-input" type="date" value={form.deceased_at}
                    onChange={e => set('deceased_at', e.target.value)} />
                </div>
              )}
              <div className="form-group full">
                <label>Description / biographie courte</label>
                <textarea className="form-textarea" value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Quelques mots sur cette personne..." />
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
