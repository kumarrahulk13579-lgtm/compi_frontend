import type { ChatMessage } from '../../lib/types'

export function getActiveAssistantMascotMessageId(messages: ChatMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') return messages[i].id
  }
  return null
}
