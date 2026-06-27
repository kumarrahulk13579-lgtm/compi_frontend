import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogIn, LogOut, Moon, Sun, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

/**
 * Profile widget for the sidebar footer (bottom-left). Shows whether the current
 * session is a guest or a registered account, and opens a popover menu with
 * sign in / sign out and the theme toggle.
 */
export function ProfileMenu() {
  const { isGuest, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = isGuest ? 'Guest' : 'Account'

  return (
    <div ref={ref} className="relative w-full">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                <User className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{label}</p>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  {isGuest ? 'Guest session' : 'Signed in'}
                </p>
              </div>
            </div>

            <div className="p-1">
              {isGuest && (
                <MenuItem
                  icon={<LogIn className="size-4" />}
                  label="Sign in / Sign up"
                  onClick={() => {
                    setOpen(false)
                    navigate('/login')
                  }}
                />
              )}
              <MenuItem
                icon={theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                onClick={toggle}
              />
              <MenuItem
                icon={<LogOut className="size-4" />}
                label="Sign out"
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--accent)]"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
          <User className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{label}</span>
          <span className="block truncate text-xs text-[var(--muted-foreground)]">
            {isGuest ? 'Guest session' : 'Signed in'}
          </span>
        </span>
      </button>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)]"
    >
      <span className="text-[var(--muted-foreground)]">{icon}</span>
      {label}
    </button>
  )
}
