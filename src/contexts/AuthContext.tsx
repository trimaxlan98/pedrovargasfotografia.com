import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '../api/client'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CLIENT'
  phone?: string
  avatar?: string
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setIsLoading(false); return }

    try {
      const res = await api.get<{ success: boolean; data: User }>('/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password, phone })
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch { /* ignorar */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
