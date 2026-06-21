import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

/**
 * Landing page for the Google OAuth redirect. The backend is expected to send
 * the JWT back as `?token=...` (or `#token=...`). If the backend instead returns
 * raw JSON, see the README note on adding a frontend redirect to the callback.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const token = search.get('token') ?? hash.get('token')

    if (token) {
      setToken(token)
      navigate('/', { replace: true })
    } else {
      toast('Google sign-in did not return a token.')
      navigate('/login', { replace: true })
    }
  }, [navigate, setToken, toast])

  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-[var(--muted-foreground)]">
      <Loader2 className="size-5 animate-spin" />
      Finishing sign-in…
    </div>
  )
}
