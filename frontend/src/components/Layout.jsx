import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABELS = { admin: 'Administrateur', joueur: 'Joueur' }

export default function Layout() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💀</div>
          <div>
            <div className="sidebar-logo-text">Death Challenge</div>
            <div className="sidebar-logo-sub">
              {isAdmin ? 'Gestion des utilisateurs' : 'Suivez vos personnalités'}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>
          {isAdmin ? (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>⚙️</span> Utilisateurs
              </NavLink>
              <NavLink
                to="/validation"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>✅</span> Validation
              </NavLink>
              <NavLink
                to="/classement"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>🏆</span> Classement
              </NavLink>
              <NavLink
                to="/regles"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>📜</span> Règles
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/selection"
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span>🎯</span> Ma sélection
            </NavLink>
          )}
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
