import type { ReactNode } from 'react'
import type { Message } from '../types'
import { MESSAGE_STATUS } from '../types'
import { formatTime } from '../utils'
import { CheckIcon, CrossIcon } from './icons'

interface MessageBubbleProps {
  message: Message
}

function renderStatus(status: MESSAGE_STATUS | undefined): ReactNode {
  switch (status) {
    case MESSAGE_STATUS.PENDING:
      return <span className="spinner" />
    case MESSAGE_STATUS.SENT:
      return (
        <span className="status-sent" title="Отправлено">
          <CheckIcon />
        </span>
      )
    case MESSAGE_STATUS.ERROR:
      return (
        <span className="status-error" title="Не отправлено">
          <CrossIcon />
        </span>
      )
    default:
      return null
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.direction === 'out'
  return (
    <div className={`bubble ${outgoing ? 'bubble-out' : 'bubble-in'}`}>
      <div className="bubble-text">{message.text}</div>
      <div className="bubble-meta">
        <span>{formatTime(message.timestamp)}</span>
        {outgoing && renderStatus(message.status)}
      </div>
    </div>
  )
}
