import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Chat, Message } from '../types'
import { formatTime, chatInitial } from '../utils'
import { LogoutIcon, PlaneIcon, PlusIcon } from './icons'

export interface ChatListItem {
  chat: Chat
  lastMessage?: Message
}

interface SidebarProps {
  items: ChatListItem[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onCreate: (identifier: string) => boolean
  onLogout: () => void
}

export default function Sidebar({ items, activeChatId, onSelect, onCreate, onLogout }: SidebarProps) {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!identifier.trim()) return
    if (onCreate(identifier)) {
      setIdentifier('')
      setError('')
    } else {
      setError('Введите корректный номер телефона')
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div className="sidebar-mark">
            <PlaneIcon />
          </div>
          <span>Чаты</span>
        </div>
        <button className="icon-button" type="button" title="Выйти" onClick={onLogout}>
          <LogoutIcon />
        </button>
      </div>

      <div className="new-chat">
        <form className="new-chat-form" onSubmit={handleSubmit}>
          <input
            type="tel"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="79876543210"
            aria-label="Номер телефона получателя"
          />
          <button type="submit" className="new-chat-button" title="Создать чат">
            <PlusIcon />
          </button>
        </form>
        {error && <div className="new-chat-error">{error}</div>}
      </div>

      <nav className="chat-list">
        {items.length === 0 && (
          <div className="chat-list-empty">
            Чатов пока нет.
            <br />
            Введите номер телефона и создайте новый чат.
          </div>
        )}
        {items.map(({ chat, lastMessage }) => (
          <button
            key={chat.id}
            type="button"
            className={`chat-item${chat.id === activeChatId ? ' active' : ''}`}
            onClick={() => onSelect(chat.id)}
          >
            <div className="avatar">{chatInitial(chat.name)}</div>
            <div className="chat-item-main">
              <div className="chat-item-top">
                <span className="chat-item-name">{chat.name}</span>
                {lastMessage && (
                  <span className="chat-item-time">{formatTime(lastMessage.timestamp)}</span>
                )}
              </div>
              <div className="chat-item-preview">
                {lastMessage
                  ? `${lastMessage.direction === 'out' ? 'Вы: ' : ''}${lastMessage.text}`
                  : chat.name}
              </div>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  )
}
