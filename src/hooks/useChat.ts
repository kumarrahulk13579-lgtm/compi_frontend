import { useCallback, useEffect, useRef, useState } from 'react'
import { chatApi } from '@/lib/api'
import { streamMessage } from '@/lib/sse'
import type { ChatMessage } from '@/lib/types'
import { useToast } from '@/context/ToastContext'

let tmpCounter = 0
const tmpId = () => `tmp-${Date.now()}-${tmpCounter++}`

export function useChat(
  conversationId: number | null,
  onTitle?: (id: number, title: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const { toast } = useToast()

  // Keep the latest title handler in a ref so `send` stays stable.
  const onTitleRef = useRef(onTitle)
  onTitleRef.current = onTitle

  // Load history whenever the active conversation changes.
  useEffect(() => {
    abortRef.current?.abort()
    setStreaming(false)
    setStatus(null)
    if (conversationId == null) {
      setMessages([])
      return
    }
    let cancelled = false
    setLoadingHistory(true)
    chatApi
      .listMessages(conversationId)
      .then((history) => {
        if (cancelled) return
        setMessages(
          history.map((m) => ({ id: String(m.id), role: m.role, content: m.content })),
        )
      })
      .catch((e) => toast(e instanceof Error ? e.message : 'Failed to load messages'))
      .finally(() => !cancelled && setLoadingHistory(false))
    return () => {
      cancelled = true
    }
  }, [conversationId, toast])

  const send = useCallback(
    (content: string) => {
      if (conversationId == null || streaming) return

      const userMsg: ChatMessage = { id: tmpId(), role: 'user', content }
      const assistantId = tmpId()
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
      }
      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)
      setStatus('Thinking...')

      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)))

      const finish = () => {
        setStreaming(false)
        setStatus(null)
        patch((m) => ({ ...m, streaming: false }))
        abortRef.current = null
      }

      abortRef.current = streamMessage(conversationId, content, {
        onStatus: (msg) => setStatus(msg),
        onToken: (token) => {
          setStatus(null)
          patch((m) => ({ ...m, content: m.content + token }))
        },
        onTitle: (title) => onTitleRef.current?.(conversationId, title),
        onDone: finish,
        onError: (err) => {
          toast(err.message || 'The stream was interrupted')
          patch((m) => ({
            ...m,
            content: m.content || '⚠️ Something went wrong. Please try again.',
          }))
          finish()
        },
      })
    },
    [conversationId, streaming, toast],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
    setStatus(null)
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
  }, [])

  return { messages, loadingHistory, streaming, status, send, stop }
}
