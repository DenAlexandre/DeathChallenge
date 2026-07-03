import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('dc_user')
    const token  = sessionStorage.getItem('dc_token')
    if (stored && token) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    sessionStorage.setItem('dc_token', data.token)
    sessionStorage.setItem('dc_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    sessionStorage.removeItem('dc_token')
    sessionStorage.removeItem('dc_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
