import { useEffect, useMemo, useRef, useState } from 'react'
import { Sidebar } from '@/components/chat/Sidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useConversations } from '@/hooks/useConversations'
import { useToast } from '@/context/ToastContext'

export function ChatPage() {
  const { conversations, loading, create } = useConversations()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('compi_sidebar_collapsed') === '1',
  )
  const autoCreated = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('compi_sidebar_collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  // Pick the most recent conversation, or create one if the user has none.
  useEffect(() => {
    if (loading || activeId != null) return
    if (conversations.length > 0) {
      setActiveId(conversations[0].id)
    } else if (!autoCreated.current) {
      autoCreated.current = true
      create('New chat')
        .then((c) => setActiveId(c.id))
        .catch((e) => toast(e instanceof Error ? e.message : 'Could not start a chat'))
    }
  }, [loading, conversations, activeId, create, toast])

  const activeTitle = useMemo(
    () => conversations.find((c) => c.id === activeId)?.title ?? null,
    [conversations, activeId],
  )

  const handleNew = async () => {
    try {
      const c = await create('New chat')
      setActiveId(c.id)
      setSidebarOpen(false)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not start a chat')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        loading={loading}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id)
          setSidebarOpen(false)
        }}
        onNew={handleNew}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatWindow
          key={activeId ?? 'none'}
          conversationId={activeId}
          title={activeTitle}
          onMenu={() => setSidebarOpen(true)}
          sidebarCollapsed={collapsed}
          onExpandSidebar={() => setCollapsed(false)}
        />
      </main>
    </div>
  )
}
