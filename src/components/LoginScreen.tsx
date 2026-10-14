import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEFAULT_API_URL, getStateInstance } from '../api/greenApi'
import type { Credentials } from '../types'
import { PlaneIcon } from './icons'

interface LoginScreenProps {
  onLogin: (creds: Credentials) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните idInstance и apiTokenInstance')
      return
    }
    setError('')
    setBusy(true)
    const creds: Credentials = {
      apiUrl: apiUrl.trim() || DEFAULT_API_URL,
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    try {
      const state = await getStateInstance(creds)
      if (state.stateInstance !== 'authorized') {
        setError('Инстанс не авторизован')
        return
      }
      onLogin(creds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="login-logo-mark">
            <PlaneIcon size={24} />
          </div>
          <h1 className="login-title">Telegram чат</h1>
        </div>
        <p className="login-subtitle">Вход через сервис GREEN-API</p>

        {error && <div className="login-error">{error}</div>}

        <div className="field">
          <label htmlFor="apiUrl">apiUrl</label>
          <input
            id="apiUrl"
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={DEFAULT_API_URL}
          />
        </div>

        <div className="field">
          <label htmlFor="idInstance">idInstance</label>
          <input
            id="idInstance"
            type="text"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="Например, 4100000000"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label htmlFor="apiTokenInstance">apiTokenInstance</label>
          <input
            id="apiTokenInstance"
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="Ключ доступа инстанса"
            autoComplete="off"
          />
        </div>

        <button className="login-button" type="submit" disabled={busy}>
          {busy ? 'Проверка…' : 'Войти'}
        </button>

        <p className="login-hint">
          Учётные данные (apiUrl, idInstance, apiTokenInstance) доступны в личном кабинете{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            console.green-api.com
          </a>
        </p>
      </form>
    </div>
  )
}
