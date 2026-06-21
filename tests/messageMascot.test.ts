import assert from 'node:assert/strict'
import { getActiveAssistantMascotMessageId } from '../src/components/chat/messageMascot.ts'
import type { ChatMessage } from '../src/lib/types'

const messages: ChatMessage[] = [
  { id: 'u1', role: 'user', content: 'first' },
  { id: 'a1', role: 'assistant', content: 'older answer' },
  { id: 'u2', role: 'user', content: 'second' },
  { id: 'a2', role: 'assistant', content: '', streaming: true },
]

assert.equal(getActiveAssistantMascotMessageId(messages), 'a2')
assert.equal(
  getActiveAssistantMascotMessageId([{ id: 'u1', role: 'user', content: 'only user' }]),
  null,
)
