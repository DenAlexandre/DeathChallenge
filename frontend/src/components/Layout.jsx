import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABELS = { admin: 'Administrateur', editor: 'Éditeur', viewer: 'Lecteur' }

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💀</div>
          <div>
            <div className="sidebar-logo-text">Death Challenge</div>
            <div className="sidebar-logo-sub">Gestion des utilisateurs</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>
          <NavLink
            to="/users"
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <span>⚙️</span> Utilisateurs
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]}</div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className={`user-role role-${user?.role}`}>{ROLE_LABELS[user?.role]}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>
            ← Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
