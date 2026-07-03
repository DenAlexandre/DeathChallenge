import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import CreatePersonModal from '../components/CreatePersonModal'
import ReportDeathModal from '../components/ReportDeathModal'
import EditPersonModal from '../components/EditPersonModal'
import { formatDate, formatAge } from '../lib/format'

export default function Selection() {
  const [mySelection, setMySelection] = useState([])
  const [loading,      setLoading]    = useState(true)
  const [query,        setQuery]      = useState('')
  const [results,      setResults]    = useState([])
  const [deathMatches, setDeathMatches] = useState([])
  const [searching,    setSearching]  = useState(false)
  const [addError,     setAddError]   = useState('')
  const [showCreate,   setShowCreate] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [regles,       setRegles]       = useState([])
  const [sortDir,      setSortDir]      = useState(null)
  const debounceRef = useRef(null)

  const loadSelection = () => {
    setLoading(true)
    return api.get('/selections').then(({ data }) => setMySelection(data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSelection()
    api.get('/regles').then(({ data }) => setRegles(data))
  }, [])

  const limiteRegle = regles.find(r => r.code === 'limite_selection')
  const selectionLimit = limiteRegle && limiteRegle.active === false ? null : (limiteRegle?.valeur ?? 10)
  const validationRequired = regles.find(r => r.code === 'validation_admin')?.active !== false
  const selectionsFrozen = regles.find(r => r.code === 'selections_gelees')?.active === true

  const runSearch = async () => {
    if (query.trim().length < 2) return
    setSearching(true)
    try {
      const { data } = await api.get('/personnalites', { params: { q: query.trim() } })
      setResults(data.results)
      setDeathMatches(data.deathMatches)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setDeathMatches([])
      return
    }
    debounceRef.current = setTimeout(runSearch, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const totalPoints = mySelection.reduce((sum, p) => sum + (p.points || 0), 0)
  const isFull = selectionLimit !== null && mySelection.length >= selectionLimit
  const selectedIds = new Set(mySelection.map(s => s.person_id))

  const toggleSort = () => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
  const displayedSelection = sortDir
    ? [...mySelection].sort((a, b) => {
        const cmp = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
        return sortDir === 'asc' ? cmp : -cmp
      })
    : mySelection

  const handleAdd = async (personId) => {
    setAddError('')
    try {
      await api.post('/selections', { personId })
      await loadSelection()
    } catch (err) {
      setAddError(err.response?.data?.error || "Erreur lors de l'ajout")
    }
  }

  const handleRemove = async (selectionId) => {
    await api.delete(`/selections/${selectionId}`)
    setMySelection(s => s.filter(x => x.id !== selectionId))
  }

  const [queryNom, queryPrenom] = (() => {
    const parts = query.trim().split(/\s+/)
    if (parts.length < 2) return [parts[0] || '', '']
    return [parts[parts.length - 1], parts.slice(0, -1).join(' ')]
  })()

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Ma sélection</div>
          <div className="page-subtitle">
            {mySelection.length}{selectionLimit !== null ? `/${selectionLimit}` : ''} personnalités choisies · {totalPoints} point{totalPoints > 1 ? 's' : ''}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Ajouter une personnalité
        </button>
      </div>

      <div className="page-body">
        {selectionsFrozen && (
          <div className="login-error" style={{ marginBottom: 20 }}>
            🔒 Les ajouts et suppressions de personnalités sont actuellement gelés par un administrateur.
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : mySelection.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Aucune personnalité sélectionnée</div>
              <div className="empty-text">Recherchez une personnalité vivante ci-dessous pour commencer.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={toggleSort}>
                      Nom {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : ''}
                    </th>
                    <th>Catégorie</th>
                    <th>Nationalité</th>
                    <th>Naissance</th>
                    <th>Âge</th>
                    <th>Statut</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSelection.map(p => (
                    <tr key={p.id}>
                      <td className="fw-600">{p.prenom} {p.nom}</td>
                      <td><span className="badge badge-cat">{p.categorie || '—'}</span></td>
                      <td className="text-muted text-sm">{p.nationalite || '—'}</td>
                      <td className="text-muted text-sm">{formatDate(p.date_naissance)}</td>
                      <td className="text-muted text-sm">{formatAge(p.date_naissance)}</td>
                      <td>
                        {p.deja_decede && (
                          <span className="badge badge-deceased">
                            ⚠️ Décédée{p.points != null ? ` — +${p.points} pts` : ''}
                          </span>
                        )}
                        {!p.deja_decede && p.statut === 'en_attente' && (
                          <span className="badge badge-en-attente">En attente de validation</span>
                        )}
                        {!p.deja_decede && p.statut === 'validee' && (
                          <span className="badge badge-alive">Vivante</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {!p.deja_decede && p.statut === 'validee' && (
                            <>
                              <button className="btn btn-ghost btn-sm" title="Modifier"
                                onClick={() => setEditTarget({
                                  id: p.person_id, nom: p.nom, prenom: p.prenom,
                                  categorie: p.categorie, nationalite: p.nationalite, date_naissance: p.date_naissance,
                                })}>✏️</button>
                              <button className="btn btn-ghost btn-sm" title="Signaler le décès"
                                onClick={() => setReportTarget({ id: p.person_id, nom: p.nom, prenom: p.prenom })}>☠️</button>
                            </>
                          )}
                          <button className="btn btn-ghost btn-sm" title={selectionsFrozen ? 'Ajouts/suppressions gelés' : 'Retirer'}
                            style={{ color: '#dc2626' }} disabled={selectionsFrozen}
                            onClick={() => handleRemove(p.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px 0' }}>
            <div className="form-group">
              <label>Rechercher une personnalité (nom ou prénom)</label>
              <input
                className="form-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ex. Nathalie Baye"
                autoFocus
              />
            </div>
            {isFull && (
              <p className="text-muted text-sm" style={{ margin: '0 0 12px' }}>
                Votre liste est complète : vous pouvez toujours proposer une nouvelle personnalité
                ou signaler un décès, mais l'ajout à votre sélection restera bloqué.
              </p>
            )}
            {addError && <div className="login-error" style={{ marginBottom: 12 }}>{addError}</div>}
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            {searching && <div className="loading"><div className="spinner" /> Recherche...</div>}

            {!searching && query.trim().length >= 2 && results.length === 0 && (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                {deathMatches.length > 0 ? (
                  <div className="login-error">
                    ⚠️ {deathMatches.map(d => `${d.prenom} ${d.nom}`).join(', ')} : déjà décédé(e),
                    impossible de sélectionner cette personne.
                  </div>
                ) : (
                  <>
                    <div className="empty-text" style={{ marginBottom: 12 }}>
                      Aucun résultat pour « {query} ».
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(true)}>
                      + Créer cette personne
                    </button>
                  </>
                )}
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Nationalité</th>
                      <th>Naissance</th>
                      <th>Âge</th>
                      <th style={{ width: 140 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => {
                      const alreadySelected = selectedIds.has(r.id)
                      return (
                        <tr key={r.id}>
                          <td className="fw-600">{r.prenom} {r.nom}</td>
                          <td><span className="badge badge-cat">{r.categorie || '—'}</span></td>
                          <td className="text-muted text-sm">{r.nationalite || '—'}</td>
                          <td className="text-muted text-sm">{formatDate(r.date_naissance)}</td>
                          <td className="text-muted text-sm">{formatAge(r.date_naissance)}</td>
                          <td>
                            {r.deja_decede ? (
                              <span className="badge badge-deceased">⚠️ Décédée</span>
                            ) : (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button className="btn btn-ghost btn-sm" title="Modifier"
                                  onClick={() => setEditTarget(r)}>✏️</button>
                                <button className="btn btn-ghost btn-sm" title="Signaler le décès"
                                  onClick={() => setReportTarget(r)}>☠️</button>
                                {alreadySelected ? (
                                  <span className="text-muted text-sm">Déjà dans la liste</span>
                                ) : selectionsFrozen ? (
                                  <span className="text-muted text-sm">Sélections gelées</span>
                                ) : isFull ? (
                                  <span className="text-muted text-sm">Liste complète</span>
                                ) : (
                                  <button className="btn btn-primary btn-sm" onClick={() => handleAdd(r.id)}>
                                    + Ajouter
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreatePersonModal
          initialNom={queryNom}
          initialPrenom={queryPrenom}
          validationRequired={validationRequired}
          isFull={isFull}
          onClose={() => setShowCreate(false)}
          onCreated={loadSelection}
        />
      )}

      {reportTarget && (
        <ReportDeathModal
          person={reportTarget}
          validationRequired={validationRequired}
          onClose={() => setReportTarget(null)}
          onReported={() => { loadSelection(); runSearch() }}
        />
      )}

      {editTarget && (
        <EditPersonModal
          person={editTarget}
          validationRequired={validationRequired}
          onClose={() => setEditTarget(null)}
          onProposed={() => { loadSelection(); runSearch() }}
        />
      )}
    </>
  )
}
