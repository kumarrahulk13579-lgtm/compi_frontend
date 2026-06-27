import { Navigate } from 'react-router-dom'
import { AuthForm } from '@/components/auth/AuthForm'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { isAuthed, isGuest } = useAuth()
  // A guest is "authed" but should still be allowed to reach the sign-in form.
  if (isAuthed && !isGuest) return <Navigate to="/" replace />

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Ambient animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-1/4 size-96 rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 size-96 rounded-full bg-[var(--primary)] opacity-10 blur-3xl" />
      </div>
      <AuthForm />
    </div>
  )
}
