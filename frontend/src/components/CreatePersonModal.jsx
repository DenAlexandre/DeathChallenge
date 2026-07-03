import { useState } from 'react'
import api from '../api/client'
import { CATEGORIES_SUGGESTIONS, NATIONALITES } from '../lib/personOptions'
import { today } from '../lib/format'

export default function CreatePersonModal({ initialNom, initialPrenom, validationRequired = true, isFull = false, onClose, onCreated }) {
  const [statutVital, setStatutVital] = useState('vivante') // 'vivante' | 'decedee'
  const [form, setForm] = useState({
    nom: initialNom || '',
    prenom: initialPrenom || '',
    categorie: '',
    nationalite: '',
    date_naissance: '',
    date_deces: '',
  })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)
  const [nationaliteAutre, setNationaliteAutre] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const isDecedee = statutVital === 'decedee'

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
      const { data: created } = await api.post('/personnalites', {
        nom: form.nom,
        prenom: form.prenom,
        categorie: form.categorie,
        nationalite: form.nationalite,
        date_naissance: form.date_naissance || null,
        date_deces: isDecedee ? form.date_deces : null,
      })
      if (!isDecedee && !isFull) {
        await api.post('/selections', { personId: created.id })
      }
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

            <div className="form-group">
              <label>Cette personne est</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button"
                  className={`btn btn-sm ${statutVital === 'vivante' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatutVital('vivante')}>
                  Vivante
                </button>
                <button type="button"
                  className={`btn btn-sm ${isDecedee ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatutVital('decedee')}>
                  Décédée
                </button>
              </div>
            </div>

            <p className="text-muted text-sm" style={{ margin: '12px 0 14px' }}>
              {!isDecedee && isFull
                ? `Votre liste est complète : cette personne sera créée${validationRequired ? ' avec le statut "en attente"' : ''} mais ne sera pas ajoutée à votre sélection.`
                : validationRequired
                  ? (isDecedee
                      ? "Ce décès sera enregistré avec le statut \"en attente\" le temps qu'un administrateur vérifie et valide les informations."
                      : 'Cette personne sera ajoutée à votre sélection avec le statut "en attente" le temps qu\'un administrateur vérifie et valide les informations.')
                  : (isDecedee
                      ? 'La validation administrateur est désactivée : ce décès sera pris en compte immédiatement.'
                      : 'La validation administrateur est désactivée : cette personne sera ajoutée à votre sélection immédiatement.')}
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
                <label>Date de naissance{isDecedee ? '' : ' *'}</label>
                <input className="form-input" type="date" value={form.date_naissance}
                  onChange={e => set('date_naissance', e.target.value)}
                  min="1900-01-01" max={today()} required={!isDecedee} />
              </div>
              {isDecedee && (
                <div className="form-group">
                  <label>Date de décès *</label>
                  <input className="form-input" type="date" value={form.date_deces}
                    onChange={e => set('date_deces', e.target.value)}
                    min="1900-01-01" max={today()} required />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Création...' : isDecedee ? 'Enregistrer le décès' : 'Créer et ajouter à ma liste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
