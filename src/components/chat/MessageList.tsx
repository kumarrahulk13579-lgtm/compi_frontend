import { useEffect, useRef } from 'react'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import type { ChatMessage } from '@/lib/types'
import type { RobotState } from '@/lib/robotState'
import { MessageBubble } from './MessageBubble'
import { StatusIndicator } from './StatusIndicator'
import { getActiveAssistantMascotMessageId } from './messageMascot'

interface Props {
  messages: ChatMessage[]
  status: string | null
  robotState: RobotState
}

export function MessageList({ messages, status, robotState }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeRobotMessageId = getActiveAssistantMascotMessageId(messages)

  // Auto-scroll to the latest content as it streams in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <LayoutGroup id="chat-message-mascot">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            robotState={robotState}
            showRobot={m.id === activeRobotMessageId}
          />
        ))}
        <AnimatePresence>
          {status && (
            <div className="flex pl-11">
              <StatusIndicator message={status} />
            </div>
          )}
        </AnimatePresence>
      </LayoutGroup>
      <div ref={bottomRef} />
    </div>
  )
}
