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

/** SSE event shapes emitted by the chat-service agent. */
export type ChatEvent =
  | { type: 'status'; message: string }
  | { type: 'content'; token: string }
  | { type: 'usage'; [k: string]: unknown }
  | { type: 'done' }
