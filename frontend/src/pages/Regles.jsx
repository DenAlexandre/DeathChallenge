import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Regles() {
  const [regles,  setRegles]  = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)
  const [valeurDrafts, setValeurDrafts] = useState({})
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetDone, setResetDone] = useState('')

  useEffect(() => {
    api.get('/regles').then(({ data }) => setRegles(data)).finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    setExporting(true)
    setExportError('')
    try {
      const res = await api.get('/export/sql', { responseType: 'blob' })
      const match = (res.headers['content-disposition'] || '').match(/filename="?([^"]+)"?/)
      const filename = match?.[1] || 'deathchallenge-export.sql'
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setExportError("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }

  const updateRegle = async (id, payload) => {
    setBusyId(id)
    try {
      const { data } = await api.put(`/regles/${id}`, payload)
      setRegles(rs => rs.map(r => r.id === id ? data : r))
    } finally {
      setBusyId(null)
    }
  }

  const handleToggle = (regle) => updateRegle(regle.id, { active: !regle.active })

  const handleValeurSave = (regle) => {
    const draft = valeurDrafts[regle.id]
    const valeur = parseInt(draft, 10)
    if (!Number.isFinite(valeur) || valeur < 1) return
    updateRegle(regle.id, { valeur })
  }

  const handleResetSelections = async () => {
    if (!window.confirm('Réinitialiser tous les comptes ? Cette action supprime les personnalités sélectionnées par tous les joueurs, pour tous les comptes. Cette action est irréversible.')) return
    setResetting(true)
    setResetError('')
    setResetDone('')
    try {
      const { data } = await api.post('/regles/reset-selections')
      setResetDone(`${data.count} sélection(s) supprimée(s).`)
    } catch {
      setResetError('Erreur lors de la réinitialisation')
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Règles du jeu</div>
          <div className="page-subtitle">Activez, désactivez ou ajustez les règles sans toucher au code</div>
        </div>
        <button className="btn btn-secondary" disabled={exporting} onClick={handleExport}>
          {exporting ? 'Export en cours...' : '⬇ Export SQL'}
        </button>
      </div>

      <div className="page-body">
        {exportError && <div className="login-error" style={{ marginBottom: 16 }}>{exportError}</div>}
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Règle</th>
                    <th>Valeur</th>
                    <th style={{ width: 120 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {regles.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="fw-600">{r.nom}</div>
                        <div className="text-muted text-sm">{r.description}</div>
                      </td>
                      <td>
                        {r.valeur !== null && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              className="form-input"
                              style={{ width: 80 }}
                              type="number"
                              min="1"
                              disabled={busyId === r.id}
                              value={valeurDrafts[r.id] ?? r.valeur}
                              onChange={e => setValeurDrafts(d => ({ ...d, [r.id]: e.target.value }))}
                            />
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={busyId === r.id || (valeurDrafts[r.id] ?? String(r.valeur)) === String(r.valeur)}
                              onClick={() => handleValeurSave(r)}
                            >
                              Enregistrer
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <label className="form-check">
                          <input type="checkbox" checked={r.active} disabled={busyId === r.id}
                            onChange={() => handleToggle(r)} />
                          <span className={`badge ${r.active ? 'badge-alive' : 'badge-deceased'}`}>
                            {r.active ? 'Activée' : 'Désactivée'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div className="fw-600" style={{ marginBottom: 4 }}>Options système</div>
          <div className="text-muted text-sm" style={{ marginBottom: 12 }}>
            Actions globales affectant tous les comptes joueurs
          </div>
          {resetError && <div className="login-error" style={{ marginBottom: 12 }}>{resetError}</div>}
          {resetDone && <div className="text-sm" style={{ marginBottom: 12, color: 'var(--color-success, green)' }}>{resetDone}</div>}
          <button className="btn btn-danger" disabled={resetting} onClick={handleResetSelections}>
            {resetting ? 'Réinitialisation en cours...' : 'Réinitialiser tous les comptes (vider les sélections)'}
          </button>
        </div>
      </div>
    </>
  )
}
