import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE, tokenStore } from './api'
import type { ChatEvent } from './types'

interface StreamHandlers {
  onStatus?: (message: string) => void
  onToken?: (token: string) => void
  onTitle?: (title: string) => void
  onDone?: () => void
  onError?: (err: Error) => void
}

/**
 * POST a message to a conversation and consume the SSE token stream.
 * Returns an AbortController so the caller can cancel an in-flight stream.
 */
export function streamMessage(
  conversationId: number,
  content: string,
  handlers: StreamHandlers,
): AbortController {
  const controller = new AbortController()
  const token = tokenStore.get()

  fetchEventSource(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
    signal: controller.signal,
    openWhenHidden: true,
    onmessage(ev) {
      if (!ev.data) return
      let parsed: ChatEvent
      try {
        parsed = JSON.parse(ev.data) as ChatEvent
      } catch {
        return
      }
      switch (parsed.type) {
        case 'status':
          handlers.onStatus?.(parsed.message)
          break
        case 'content':
          handlers.onToken?.(parsed.token)
          break
        case 'title':
          handlers.onTitle?.(parsed.title)
          break
        case 'done':
          handlers.onDone?.()
          controller.abort()
          break
        default:
          break
      }
    },
    onclose() {
      handlers.onDone?.()
    },
    onerror(err) {
      handlers.onError?.(err instanceof Error ? err : new Error(String(err)))
      // Throw to stop fetchEventSource's automatic retry loop.
      throw err
    },
  }).catch(() => {
    /* aborts surface here; already handled via onerror */
  })

  return controller
}
