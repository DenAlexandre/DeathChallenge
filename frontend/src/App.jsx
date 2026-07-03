import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout           from './components/Layout'
import Login            from './pages/Login'
import Users            from './pages/Users'
import Selection        from './pages/Selection'
import PendingValidation from './pages/PendingValidation'
import Leaderboard       from './pages/Leaderboard'
import Regles            from './pages/Regles'
import Personalities     from './pages/Personalities'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/selection" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'admin' ? '/users' : '/selection'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<HomeRedirect />} />
            <Route path="selection" element={<Selection />} />
            <Route path="users" element={
              <ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>
            } />
            <Route path="validation" element={
              <ProtectedRoute requiredRole="admin"><PendingValidation /></ProtectedRoute>
            } />
            <Route path="classement" element={<Leaderboard />} />
            <Route path="optionsysteme" element={
              <ProtectedRoute requiredRole="admin"><Regles /></ProtectedRoute>
            } />
            <Route path="personnalites" element={
              <ProtectedRoute requiredRole="admin"><Personalities /></ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
