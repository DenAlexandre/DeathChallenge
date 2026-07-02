import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DEMO_USERS = [
  { username: 'admin',  password: 'admin123',  label: 'Administrateur', badge: 'badge-admin'  },
  { username: 'editor', password: 'editor123', label: 'Éditeur',        badge: 'badge-editor' },
  { username: 'viewer', password: 'viewer123', label: 'Lecteur',        badge: 'badge-viewer' },
]

export default function Login() {
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">💀</div>
          <div className="login-title">Death Challenge</div>
          <div className="login-subtitle">Connectez-vous pour accéder à l'application</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="login-fg">
            <label>Identifiant</label>
            <input
              className="login-input"
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="Votre identifiant"
              autoFocus
              required
            />
          </div>

          <div className="login-fg">
            <label>Mot de passe</label>
            <input
              className="login-input"
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="demo-creds-box">
          <div className="demo-creds-title">Comptes de démonstration (cliquer pour remplir)</div>
          {DEMO_USERS.map(u => (
            <div key={u.username} className="demo-row"
              onClick={() => setForm({ username: u.username, password: u.password })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${u.badge}`}>{u.label}</span>
                <span className="demo-mono"><strong>{u.username}</strong></span>
              </div>
              <span className="demo-mono">{u.password}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
