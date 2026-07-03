import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABELS = { admin: 'Administrateur', joueur: 'Joueur' }

export default function Layout() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Referme le tiroir mobile à chaque changement de page.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <div className="app-layout">
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-topbar-title">💀 Death Challenge</span>
      </div>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
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
                to="/personnalites"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>👥</span> Personnalités
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
                <span>📜</span> Options système
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/selection"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>🎯</span> Ma sélection
              </NavLink>
              <NavLink
                to="/classement"
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span>🏆</span> Classement
              </NavLink>
            </>
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
