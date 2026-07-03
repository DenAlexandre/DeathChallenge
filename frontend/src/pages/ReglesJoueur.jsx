import { useState, useEffect } from 'react'
import api from '../api/client'

export default function ReglesJoueur() {
  const [regles,  setRegles]  = useState([])
  const [guybetException, setGuybetException] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/regles'),
      api.get('/regles/exception-guybet'),
    ]).then(([reglesRes, guybetRes]) => {
      setRegles(reglesRes.data)
      setGuybetException(guybetRes.data.active)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Règles du jeu</div>
          <div className="page-subtitle">Comment fonctionne le calcul des points</div>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : (
            <div className="option-list">
              {regles.map(r => (
                <div className="option-row" key={r.id}>
                  <div className="option-icon">{r.active ? '✅' : '⛔'}</div>
                  <div className="option-info">
                    <div className="option-title">{r.nom}</div>
                    <div className="option-desc">
                      {r.description}
                      {r.valeur !== null && r.active && (
                        <span className="fw-600"> (actuellement : {r.valeur}{r.code === 'bonus_meme_jour' ? ' %' : r.code === 'bonus_unique' ? ' pts' : ''})</span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${r.active ? 'badge-alive' : 'badge-deceased'}`}>
                    {r.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}

              {guybetException && (
                <div className="option-row">
                  <div className="option-icon">🚫</div>
                  <div className="option-info">
                    <div className="option-title">Exception : Henri Guybet</div>
                    <div className="option-desc">Cette personnalité ne rapporte jamais de points à son décès, quelles que soient les autres règles actives.</div>
                  </div>
                  <span className="badge badge-alive">Active</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
