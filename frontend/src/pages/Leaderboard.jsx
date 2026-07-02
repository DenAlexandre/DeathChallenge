import { useState, useEffect } from 'react'
import api from '../api/client'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/leaderboard').then(({ data }) => setRows(data)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Classement</div>
          <div className="page-subtitle">Points cumulés par utilisateur (100 - âge au décès, minimum 0)</div>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">Aucun utilisateur pour le moment.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rang</th>
                    <th>Utilisateur</th>
                    <th>Décès comptabilisés</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id}>
                      <td className="fw-600">{MEDALS[i] || `#${i + 1}`}</td>
                      <td className="fw-600">{r.username}</td>
                      <td className="text-muted text-sm">{r.deces_count}</td>
                      <td className="fw-600">{r.total_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
