import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Chat, Message } from '../types'
import { formatChatSubtitle, chatInitial } from '../utils'
import MessageBubble from './MessageBubble'
import { SendIcon } from './icons'

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  onSend: (text: string) => void
}

export default function ChatWindow({ chat, messages, onSend }: ChatWindowProps) {
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, chat.id])

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const handleSend = (event: FormEvent) => {
    event.preventDefault()
    send()
  }

  return (
    <section className="chat-area">
      <header className="chat-header">
        <div className="avatar">{chatInitial(chat.name)}</div>
        <div>
          <div className="chat-header-name">{chat.name}</div>
          <div className="chat-header-phone">{formatChatSubtitle(chat.id)}</div>
        </div>
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <div className="messages-empty">Сообщений пока нет. Напишите первым!</div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      <footer className="chat-footer">
        <form className="message-form" onSubmit={handleSend}>
          <input
            className="message-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите сообщение…"
            aria-label="Текст сообщения"
          />
          <button
            className="send-button"
            type="submit"
            disabled={!text.trim()}
            title="Отправить сообщение"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </section>
  )
}
