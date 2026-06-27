export interface Conversation {
  id: number
  user_id: number
  title: string | null
  summary: string | null
  created_at: string
}

export interface Message {
  id: number
  conversation_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

/** A message held in the UI; `id` may be a temporary client id while streaming. */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

/** The configurable rate-limit scopes (admin). */
export type LimitScope = 'global_total' | 'global_guest' | 'user_guest' | 'user_registered'

/** A single rate limit as returned by GET/PUT /chat/admin/limits. */
export interface Limit {
  scope: LimitScope
  unit: string
  amount: number
  updated_at: string
}

/** Partial update body for PUT /chat/admin/limits — omit fields to leave unchanged. */
export type LimitUpdate = Partial<Record<LimitScope, number>>

/** SSE event shapes emitted by the chat-service agent. */
export type ChatEvent =
  | { type: 'status'; message: string }
  | { type: 'content'; token: string }
  | { type: 'usage'; [k: string]: unknown }
  | { type: 'done' }
