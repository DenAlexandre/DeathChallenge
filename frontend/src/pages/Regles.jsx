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
  const [computing, setComputing] = useState(false)
  const [computeError, setComputeError] = useState('')
  const [computeDone, setComputeDone] = useState('')
  const [guybetException, setGuybetException] = useState(null)
  const [guybetBusy, setGuybetBusy] = useState(false)

  useEffect(() => {
    api.get('/regles').then(({ data }) => setRegles(data)).finally(() => setLoading(false))
    api.get('/regles/exception-guybet').then(({ data }) => setGuybetException(data.active))
  }, [])

  const handleToggleGuybet = async () => {
    setGuybetBusy(true)
    try {
      const { data } = await api.put('/regles/exception-guybet', { active: !guybetException })
      setGuybetException(data.active)
    } finally {
      setGuybetBusy(false)
    }
  }

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

  const handleComputePointsAnnee = async () => {
    setComputing(true)
    setComputeError('')
    setComputeDone('')
    try {
      const { data } = await api.post('/regles/points-annee')
      const { corrections, leaderboard } = data
      const total = leaderboard.reduce((sum, r) => sum + r.total_points, 0)
      const correctionMsg = corrections > 0 ? ` (${corrections} anomalie(s) corrigée(s))` : ''
      setComputeDone(`Calcul terminé : ${total} point(s) au total sur ${leaderboard.length} joueur(s)${correctionMsg}.`)
    } catch {
      setComputeError('Erreur lors du calcul')
    } finally {
      setComputing(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Options système</div>
          <div className="page-subtitle">Activez, désactivez ou ajustez les règles sans toucher au code</div>
        </div>
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
                  {guybetException !== null && (
                    <tr>
                      <td>
                        <div className="fw-600">Exception : Henri Guybet</div>
                        <div className="text-muted text-sm">
                          Cette personnalité ne rapporte jamais de points à son décès, quelles que soient les autres règles actives.
                        </div>
                      </td>
                      <td></td>
                      <td>
                        <label className="form-check">
                          <input type="checkbox" checked={guybetException} disabled={guybetBusy}
                            onChange={handleToggleGuybet} />
                          <span className={`badge ${guybetException ? 'badge-alive' : 'badge-deceased'}`}>
                            {guybetException ? 'Activée' : 'Désactivée'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="fw-600">Options système</div>
            <div className="text-muted text-sm">Actions globales affectant tous les comptes joueurs</div>
          </div>

          <div className="option-list">
            <div className="option-row">
              <div className="option-icon">⬇</div>
              <div className="option-info">
                <div className="option-title">Export SQL</div>
                <div className="option-desc">Télécharger un export complet de la base de données</div>
              </div>
              <button className="btn btn-secondary" disabled={exporting} onClick={handleExport}>
                {exporting ? 'Export en cours...' : 'Exporter'}
              </button>
            </div>
            {exportError && <div className="option-feedback login-error">{exportError}</div>}

            <div className="option-row">
              <div className="option-icon">🏆</div>
              <div className="option-info">
                <div className="option-title">Comptage des points de l'année</div>
                <div className="option-desc">Vérifie et applique toutes les règles (points de base, bonus) sur tous les joueurs, corrige les anomalies, puis calcule les points de l'année depuis le 1er janvier</div>
              </div>
              <button className="btn btn-secondary" disabled={computing} onClick={handleComputePointsAnnee}>
                {computing ? 'Calcul en cours...' : 'Calculer'}
              </button>
            </div>
            {computeError && <div className="option-feedback login-error">{computeError}</div>}
            {computeDone && <div className="option-feedback text-sm" style={{ color: 'var(--success)' }}>{computeDone}</div>}

            <div className="option-row danger">
              <div className="option-icon">⚠</div>
              <div className="option-info">
                <div className="option-title">Réinitialiser tous les comptes</div>
                <div className="option-desc">Supprime la sélection de personnalités de tous les joueurs. Action irréversible.</div>
              </div>
              <button className="btn btn-danger" disabled={resetting} onClick={handleResetSelections}>
                {resetting ? 'En cours...' : 'Réinitialiser'}
              </button>
            </div>
            {resetError && <div className="option-feedback login-error">{resetError}</div>}
            {resetDone && <div className="option-feedback text-sm" style={{ color: 'var(--success)' }}>{resetDone}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
