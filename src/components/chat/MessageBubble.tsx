import { memo } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'
import type { RobotState } from '@/lib/robotState'
import { TypingDots } from './TypingDots'
import { RobotMascot } from './RobotMascot'

export const MessageBubble = memo(function MessageBubble({
  message,
  robotState = 'idle',
  showRobot = false,
}: {
  message: ChatMessage
  robotState?: RobotState
  showRobot?: boolean
}) {
  const isUser = message.role === 'user'
  const empty = message.content.length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex w-full gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
          <User className="size-4" />
        </div>
      ) : (
        <div className="flex size-11 shrink-0 items-center justify-center">
          {showRobot && (
            <motion.div
              layoutId="active-chat-robot"
              transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.55 }}
            >
              <RobotMascot state={message.streaming ? robotState : 'idle'} size={48} />
            </motion.div>
          )}
        </div>
      )}

      <div
        className={cn(
          'max-w-[min(80%,46rem)] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'rounded-tr-sm bg-[var(--primary)] text-[var(--primary-foreground)]'
            : 'rounded-tl-sm border border-[var(--border)] bg-[var(--card)]',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : empty && message.streaming ? (
          <TypingDots />
        ) : (
          <div className="prose-chat break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
            {message.streaming && (
              <motion.span
                className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-[var(--primary)]"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
})
