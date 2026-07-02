import { useState, useEffect } from 'react'
import api from '../api/client'
import { formatDate, formatAge } from '../lib/format'

function PendingSection({ title, subtitle, emptyText, pendingPath, validatePath, rejectPath, showDeath }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)

  const load = () => {
    setLoading(true)
    return api.get(pendingPath).then(({ data }) => setPending(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id) => {
    setBusyId(id)
    try {
      await api.put(validatePath(id))
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    setBusyId(id)
    try {
      await api.delete(rejectPath(id))
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: '16px 20px 0' }}>
        <div className="fw-600">{title}</div>
        <div className="text-muted text-sm">{subtitle}</div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Chargement...</div>
      ) : pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-text">{emptyText}</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Nationalité</th>
                <th>Naissance</th>
                <th>Âge</th>
                {showDeath && <th>Décès</th>}
                <th>Proposé par</th>
                <th style={{ width: 170 }}></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(p => (
                <tr key={p.id}>
                  <td className="fw-600">{p.prenom} {p.nom}</td>
                  <td><span className="badge badge-cat">{p.categorie || '—'}</span></td>
                  <td className="text-muted text-sm">{p.nationalite || '—'}</td>
                  <td className="text-muted text-sm">{formatDate(p.date_naissance)}</td>
                  <td className="text-muted text-sm">{formatAge(p.date_naissance, showDeath ? p.date_deces : null)}</td>
                  {showDeath && <td className="text-muted text-sm">{formatDate(p.date_deces)}</td>}
                  <td className="text-muted text-sm">{p.proposed_by || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" disabled={busyId === p.id}
                        onClick={() => handleValidate(p.id)}>
                        Valider
                      </button>
                      <button className="btn btn-ghost btn-sm" disabled={busyId === p.id}
                        style={{ color: '#dc2626' }}
                        onClick={() => handleReject(p.id)}>
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function fieldDiff(label, before, after) {
  const b = before || '—'
  const a = after || '—'
  if (b === a) return null
  return `${label} : ${b} → ${a}`
}

function PersonEditsSection() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)

  const load = () => {
    setLoading(true)
    return api.get('/person-edits/pending').then(({ data }) => setPending(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id) => {
    setBusyId(id)
    try {
      await api.put(`/person-edits/${id}/validate`)
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    setBusyId(id)
    try {
      await api.delete(`/person-edits/${id}`)
      setPending(p => p.filter(x => x.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: '16px 20px 0' }}>
        <div className="fw-600">Modifications proposées</div>
        <div className="text-muted text-sm">Corrections de personnalités existantes, proposées par des joueurs</div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Chargement...</div>
      ) : pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-text">Aucune modification en attente.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Personne</th>
                <th>Modifications</th>
                <th>Proposé par</th>
                <th style={{ width: 170 }}></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(e => {
                const diffs = [
                  fieldDiff('Nom', e.nom_actuel, e.nom),
                  fieldDiff('Prénom', e.prenom_actuel, e.prenom),
                  fieldDiff('Catégorie', e.categorie_actuel, e.categorie),
                  fieldDiff('Nationalité', e.nationalite_actuel, e.nationalite),
                  fieldDiff('Naissance', formatDate(e.date_naissance_actuel), formatDate(e.date_naissance)),
                ].filter(Boolean)
                return (
                  <tr key={e.id}>
                    <td className="fw-600">{e.prenom_actuel} {e.nom_actuel}</td>
                    <td className="text-sm">
                      {diffs.length > 0
                        ? diffs.map((d, i) => <div key={i}>{d}</div>)
                        : <span className="text-muted">Aucun changement détecté</span>}
                    </td>
                    <td className="text-muted text-sm">{e.proposed_by || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" disabled={busyId === e.id}
                          onClick={() => handleValidate(e.id)}>
                          Valider
                        </button>
                        <button className="btn btn-ghost btn-sm" disabled={busyId === e.id}
                          style={{ color: '#dc2626' }}
                          onClick={() => handleReject(e.id)}>
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function PendingValidation() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Validation des propositions</div>
          <div className="page-subtitle">Personnalités et décès proposés par les joueurs, en attente de vérification</div>
        </div>
      </div>

      <div className="page-body">
        <PendingSection
          title="Personnalités vivantes"
          subtitle="Nouvelles entrées proposées pour une sélection"
          emptyText="Aucune proposition en attente pour le moment."
          pendingPath="/personnalites/pending"
          validatePath={id => `/personnalites/${id}/validate`}
          rejectPath={id => `/personnalites/${id}`}
        />
        <PersonEditsSection />
        <PendingSection
          title="Décès signalés"
          subtitle="Décès signalés ou proposés par des joueurs"
          emptyText="Aucun décès en attente de vérification."
          pendingPath="/personnalites/pending-deaths"
          validatePath={id => `/personnalites/${id}/validate-death`}
          rejectPath={id => `/personnalites/${id}/death-report`}
          showDeath
        />
      </div>
    </>
  )
}
