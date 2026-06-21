import { useCallback, useEffect, useState } from 'react'
import { chatApi } from '@/lib/api'
import type { Conversation } from '@/lib/types'
import { useToast } from '@/context/ToastContext'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const refresh = useCallback(async () => {
    try {
      const data = await chatApi.listConversations()
      // Newest first.
      setConversations([...data].sort((a, b) => b.id - a.id))
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (title: string) => {
      const convo = await chatApi.createConversation(title)
      setConversations((prev) => [convo, ...prev])
      return convo
    },
    [],
  )

  return { conversations, loading, refresh, create }
}
