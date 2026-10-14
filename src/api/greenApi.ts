import type { Credentials, IncomingNotification } from '../types'

export const DEFAULT_API_URL = 'https://api.green-api.com'
const REQUEST_TIMEOUT = 15000

function baseUrl(creds: Credentials): string {
  return `${creds.apiUrl.replace(/\/+$/, '')}/waInstance${creds.idInstance}`
}

function extractError(text: string): string {
  try {
    const data = JSON.parse(text) as Record<string, unknown>
    if (typeof data.error_description === 'string') return data.error_description
    if (typeof data.error === 'string') return data.error
  } catch {
    // нет JSON
  }
  return text
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  let response: Response
  try {
    response = await fetch(url, { ...init, signal: controller.signal })
  } catch {
    throw new Error('Нет соединения с сервером GREEN-API')
  } finally {
    clearTimeout(timer)
  }
  const text = await response.text()
  if (!response.ok) {
    throw new Error(extractError(text) || `HTTP ${response.status}`)
  }
  return text ? (JSON.parse(text) as T) : (null as T)
}

export async function getStateInstance(creds: Credentials): Promise<{ stateInstance: string }> {
  return requestJson(`${baseUrl(creds)}/getStateInstance/${creds.apiTokenInstance}`)
}

export async function sendMessage(
  creds: Credentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  return requestJson(`${baseUrl(creds)}/sendMessage/${creds.apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
}

export async function receiveNotification(creds: Credentials): Promise<IncomingNotification | null> {
  return requestJson(
    `${baseUrl(creds)}/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=5`,
  )
}

export async function deleteNotification(creds: Credentials, receiptId: number): Promise<void> {
  await requestJson(
    `${baseUrl(creds)}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`,
    { method: 'DELETE' },
  )
}
