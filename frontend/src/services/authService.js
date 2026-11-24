import api from '../config/api.js'

const SESSION_KEY = 'quizora-auth-session'
export const AUTH_SESSION_EVENT = 'quizora-auth-session-change'
let refreshRequest

export async function registerWithUsername(username, password) {
  const { data } = await api.post('/api/auth/register', { username, password })
  return data.data.session
}

export async function signInWithUsername(username, password) {
  const { data } = await api.post('/api/auth/login', { username, password })
  return data.data.session
}

export function getStoredSession() {
  const serialized = window.localStorage.getItem(SESSION_KEY)
  if (!serialized) return null

  try {
    const session = JSON.parse(serialized)
    if (!session?.access_token || !session?.refresh_token || !session?.user) {
      throw new Error('Stored session is incomplete.')
    }
    return session
  } catch {
    clearStoredSession()
    throw new Error('Sesi akun tidak valid. Silakan masuk kembali.')
  }
}

export function saveStoredSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT, { detail: session }))
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT, { detail: null }))
}

export async function refreshStoredSession(session = getStoredSession()) {
  if (!session?.refresh_token) {
    throw new Error('Sesi akun berakhir. Silakan masuk kembali.')
  }

  if (!refreshRequest) {
    refreshRequest = api.post('/api/auth/refresh', { refresh_token: session.refresh_token })
      .then(({ data }) => {
        const refreshedSession = data.data.session
        saveStoredSession(refreshedSession)
        return refreshedSession
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

export async function getUserAuthorization() {
  let session = getStoredSession()
  if (!session?.access_token) {
    throw new Error('Silakan masuk kembali untuk melanjutkan.')
  }

  const expiresAt = session.expires_at ?? 0
  if (expiresAt <= Math.floor(Date.now() / 1000) + 60) {
    try {
      session = await refreshStoredSession(session)
    } catch (error) {
      clearStoredSession()
      throw error
    }
  }

  return { Authorization: `Bearer ${session.access_token}` }
}
