import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed, guest } = useAuth()
  const { toast } = useToast()
  const [failed, setFailed] = useState(false)
  const started = useRef(false)

  // Not logged in? Start an anonymous guest session automatically.
  useEffect(() => {
    if (isAuthed || started.current) return
    started.current = true
    guest().catch((err) => {
      toast(err instanceof Error ? err.message : 'Could not start a session.')
      setFailed(true)
    })
  }, [isAuthed, guest, toast])

  if (isAuthed) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-[var(--muted-foreground)]">
      {failed ? (
        <button
          className="font-medium text-[var(--primary)] hover:underline"
          onClick={() => {
            started.current = false
            setFailed(false)
            guest().catch(() => setFailed(true))
          }}
        >
          Retry
        </button>
      ) : (
        <>
          <Loader2 className="size-5 animate-spin" />
          Starting…
        </>
      )}
    </div>
  )
}
