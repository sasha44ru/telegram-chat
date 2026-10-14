export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface Chat {
  id: string
  phone: string
  name: string
}

export type ChatsMap = Record<string, Chat>

export type MessageDirection = 'in' | 'out'

export enum MESSAGE_STATUS {
  PENDING = 'pending',
  SENT = 'sent',
  ERROR = 'error',
}

export interface Message {
  id: string
  chatId: string
  text: string
  direction: MessageDirection
  timestamp: number
  status?: MESSAGE_STATUS
}

export type MessagesMap = Record<string, Message[]>

export interface SenderData {
  chatId?: string
  sender?: string
  chatName?: string
  senderName?: string
  senderContactName?: string
}

export interface WebhookBody {
  typeWebhook?: string
  timestamp?: number
  idMessage?: string
  senderData?: SenderData
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
  }
}

export interface IncomingNotification {
  receiptId: number
  body: WebhookBody
}
