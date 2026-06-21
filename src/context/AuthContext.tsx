import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, setUnauthorizedHandler, tokenStore } from '@/lib/api'

interface AuthCtx {
  token: string | null
  isAuthed: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  setToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStore.get())

  const setToken = (t: string) => {
    tokenStore.set(t)
    setTokenState(t)
  }

  const logout = () => {
    tokenStore.clear()
    setTokenState(null)
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [])

  const login = async (email: string, password: string) => {
    const { token } = await authApi.login(email, password)
    setToken(token)
  }

  const register = async (name: string, email: string, password: string) => {
    const { token } = await authApi.register(name, email, password)
    setToken(token)
  }

  return (
    <AuthContext.Provider value={{ token, isAuthed: !!token, login, register, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
