import { motion } from 'framer-motion'
import { Menu, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChat } from '@/hooks/useChat'
import { deriveRobotState } from '@/lib/robotState'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { RobotMascot } from './RobotMascot'

interface Props {
  conversationId: number | null
  title: string | null
  onMenu: () => void
  sidebarCollapsed: boolean
  onExpandSidebar: () => void
  onTitle?: (id: number, title: string) => void
}

const SUGGESTIONS = [
  'What can you help me with?',
  'What time is it right now?',
  'Calculate 1234 * 5678',
  'Search the web for the latest AI news',
]

export function ChatWindow({
  conversationId,
  title,
  onMenu,
  sidebarCollapsed,
  onExpandSidebar,
  onTitle,
}: Props) {
  const { messages, loadingHistory, streaming, status, send, stop } = useChat(
    conversationId,
    onTitle,
  )
  const isEmpty = !loadingHistory && messages.length === 0
  const robotState = deriveRobotState(status, streaming)

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}>
          <Menu className="size-5" />
        </Button>
        {/* expand sidebar (desktop, only when collapsed) */}
        {sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={onExpandSidebar}
            aria-label="Open sidebar"
          >
            <PanelLeft className="size-5" />
          </Button>
        )}
        <h2 className="truncate text-sm font-medium">
          {conversationId == null ? 'New conversation' : title || 'Untitled chat'}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-[var(--muted)]" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState onPick={send} disabled={conversationId == null} />
        ) : (
          <MessageList messages={messages} status={status} robotState={robotState} />
        )}
      </div>

      <Composer onSend={send} onStop={stop} streaming={streaming} disabled={conversationId == null} />
    </div>
  )
}

function EmptyState({ onPick, disabled }: { onPick: (t: string) => void; disabled: boolean }) {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-2"
      >
        <RobotMascot state="idle" size={168} />
      </motion.div>
      <h1 className="mb-2 text-2xl font-semibold">How can I help you today?</h1>
      <p className="mb-8 text-sm text-[var(--muted-foreground)]">
        Ask anything — I can use tools like web search, a calculator, and more.
      </p>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            disabled={disabled}
            onClick={() => onPick(s)}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 text-left text-sm transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
