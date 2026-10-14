export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits.length === 10) digits = '7' + digits
  if (digits.length < 10 || digits.length > 15) return null
  return digits
}

export function formatPhone(digits: string): string {
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return `+${digits}`
}

export function phoneFromChatId(chatId: string): string {
  const match = chatId.match(/^(\d+)@/)
  return match ? match[1] : chatId
}

export function formatChatSubtitle(chatId: string): string {
  if (chatId.endsWith('@c.us')) return formatPhone(phoneFromChatId(chatId))
  return `ID ${chatId}`
}

export function chatInitial(name: string): string {
  const match = name.match(/[a-zа-я0-9]/i)
  return (match?.[0] ?? '?').toUpperCase()
}

export function formatTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
