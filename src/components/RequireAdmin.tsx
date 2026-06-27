import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

/**
 * Gate for admin-only routes. Assumes it is rendered inside RequireAuth, so a
 * token already exists; here we only check the role. Non-admins go back to chat.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
