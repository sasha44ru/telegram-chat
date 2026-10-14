import { useEffect, useState } from 'react'
import type { ChatsMap, Credentials, MessagesMap, WebhookBody } from './types'
import { MESSAGE_STATUS } from './types'
import { deleteNotification, receiveNotification, sendMessage } from './api/greenApi'
import { formatChatSubtitle, formatPhone, normalizePhone, phoneFromChatId } from './utils'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import type { ChatListItem } from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import { PlaneIcon } from './components/icons'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(null)
  const [chats, setChats] = useState<ChatsMap>({})
  const [messages, setMessages] = useState<MessagesMap>({})
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const handleNotificationBody = (body: WebhookBody) => {
    if (body.typeWebhook !== 'incomingMessageReceived') return
    if (body.messageData?.typeMessage !== 'textMessage') return
    const text = body.messageData.textMessageData?.textMessage
    const chatId = body.senderData?.chatId || body.senderData?.sender
    const idMessage = body.idMessage
    if (!text || !chatId || !idMessage) return

    setMessages((prev) => {
      const list = prev[chatId] ?? []
      if (list.some((m) => m.id === idMessage)) return prev
      const message = {
        id: idMessage,
        chatId,
        text,
        direction: 'in' as const,
        timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
      }
      return { ...prev, [chatId]: [...list, message] }
    })

    const name = body.senderData?.chatName || body.senderData?.senderName || body.senderData?.senderContactName

    setChats((prev) => {
      const existing = prev[chatId]
      if (existing) {
        return name ? { ...prev, [chatId]: { ...existing, name } } : prev
      }
      const phone = phoneFromChatId(chatId)
      return {
        ...prev,
        [chatId]: { id: chatId, phone, name: name || formatChatSubtitle(chatId) },
      }
    })
  }

  useEffect(() => {
    if (!creds) return
    let alive = true
    ;(async () => {
      while (alive) {
        try {
          const notification = await receiveNotification(creds)
          if (!alive) break;
          if (notification) {
            handleNotificationBody(notification.body)
            await deleteNotification(creds, notification.receiptId)
          }
        } catch (error) {
          console.error('Ошибка получения уведомлений:', error)
          await sleep(3000)
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [creds])

  const handleCreateChat = (identifier: string): boolean => {
    const phone = normalizePhone(identifier.replace(/\D/g, ''))
    if (!phone) return false
    const chatId = `${phone}@c.us`
    setChats((prev) => {
      if (prev[chatId]) return prev
      return { ...prev, [chatId]: { id: chatId, phone, name: formatPhone(phone) } }
    })
    setActiveChatId(chatId)
    return true
  }

  const handleSend = async (text: string) => {
    if (!creds || !activeChatId) return
    const chatId = activeChatId
    const localId = `local-${Date.now()}`
    setMessages((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] ?? []),
        {
          id: localId,
          chatId,
          text,
          direction: 'out' as const,
          timestamp: Date.now(),
          status: MESSAGE_STATUS.PENDING,
        },
      ],
    }))
    try {
      const { idMessage } = await sendMessage(creds, chatId, text)
      setMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] ?? []).map((m) =>
          m.id === localId ? { ...m, id: idMessage, status: MESSAGE_STATUS.SENT } : m,
        ),
      }))
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      setMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] ?? []).map((m) =>
          m.id === localId ? { ...m, status: MESSAGE_STATUS.ERROR } : m,
        ),
      }))
    }
  }

  const handleLogout = () => {
    setCreds(null)
    setActiveChatId(null)
  }

  const chatItems: ChatListItem[] = Object.values(chats)
    .map((chat) => {
      const list = messages[chat.id]
      return { chat, lastMessage: list?.[list.length - 1] }
    })
    .sort((a, b) => (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0))

  const activeChat = activeChatId ? chats[activeChatId] : undefined
  const activeMessages = activeChatId ? (messages[activeChatId] ?? []) : []

  if (!creds) {
    return <LoginScreen onLogin={setCreds} />
  }

  return (
    <div className="app">
      <Sidebar
        items={chatItems}
        activeChatId={activeChatId}
        onSelect={setActiveChatId}
        onCreate={handleCreateChat}
        onLogout={handleLogout}
      />
      {activeChat ? (
        <ChatWindow chat={activeChat} messages={activeMessages} onSend={handleSend} />
      ) : (
        <section className="empty-chat">
          <div className="empty-chat-icon">
            <PlaneIcon size={48} />
          </div>
          <h2>Telegram чат</h2>
          <p>Выберите чат слева или создайте новый по номеру телефона.</p>
        </section>
      )}
    </div>
  )
}
