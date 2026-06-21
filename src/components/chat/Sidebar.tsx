import { AnimatePresence, motion } from 'framer-motion'
import {
  LogOut,
  MessageSquarePlus,
  Moon,
  MessageSquare,
  PanelLeftClose,
  Sun,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'

interface Props {
  conversations: Conversation[]
  loading: boolean
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({
  conversations,
  loading,
  activeId,
  onSelect,
  onNew,
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: Props) {
  const { theme, toggle } = useTheme()
  const { logout } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] transition-[transform,width] duration-300 md:static',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed
            ? 'md:w-0 md:-translate-x-full md:overflow-hidden md:border-0'
            : 'md:w-72 md:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]">
              C
            </div>
            <span className="font-semibold">Compi</span>
          </div>
          {/* collapse (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-5" />
          </Button>
          {/* close (mobile) */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="px-3">
          <Button onClick={onNew} className="w-full justify-start">
            <MessageSquarePlus className="size-4" />
            New chat
          </Button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-[var(--muted)]" />
            ))
          ) : conversations.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-[var(--muted-foreground)]">
              No conversations yet. Start a new chat!
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                  activeId === c.id
                    ? 'bg-[var(--accent)] font-medium'
                    : 'hover:bg-[var(--accent)]/60',
                )}
              >
                <MessageSquare className="size-4 shrink-0 text-[var(--muted-foreground)]" />
                <span className="truncate">{c.title || 'Untitled chat'}</span>
              </button>
            ))
          )}
        </nav>

        <div className="flex items-center gap-1 border-t border-[var(--border)] p-3">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="ghost" className="flex-1 justify-start" onClick={logout}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  )
}
