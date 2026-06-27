import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, setUnauthorizedHandler, tokenStore } from '@/lib/api'

interface TokenClaims {
  sub?: string
  role?: string
  is_registered?: boolean
  exp?: number
}

/** Decode a JWT payload without verifying the signature (read-only client use). */
function decodeToken(token: string | null): TokenClaims | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as TokenClaims
  } catch {
    return null
  }
}

interface AuthCtx {
  token: string | null
  isAuthed: boolean
  /** True for an anonymous guest session (not a registered account). */
  isGuest: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  guest: () => Promise<void>
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

  const guest = async () => {
    const { token } = await authApi.guest()
    setToken(token)
  }

  const isGuest = useMemo(() => {
    const claims = decodeToken(token)
    return !!claims && claims.is_registered === false
  }, [token])

  return (
    <AuthContext.Provider
      value={{ token, isAuthed: !!token, isGuest, login, register, guest, setToken, logout }}
    >
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
