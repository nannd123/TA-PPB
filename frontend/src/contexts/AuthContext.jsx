import { useEffect, useState } from 'react'
import AuthContext from './authContext.js'
import {
  AUTH_SESSION_EVENT,
  clearStoredSession,
  getStoredSession,
  refreshStoredSession,
  saveStoredSession,
} from '../services/authService.js'
import { getApiError } from '../utils/apiError.js'

function getInitialAuthState() {
  try {
    const session = getStoredSession()
    const expiresAt = session?.expires_at ?? 0
    const refreshRequired = Boolean(session && expiresAt <= Math.floor(Date.now() / 1000) + 60)
    return { session, loading: refreshRequired, error: '' }
  } catch (sessionError) {
    return {
      session: null,
      loading: false,
      error: sessionError instanceof Error ? sessionError.message : 'Sesi akun tidak dapat diperiksa.',
    }
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState)
  const { session, loading, error } = authState

  useEffect(() => {
    let active = true
    const handleSessionChange = (event) => {
      setAuthState({ session: event.detail, loading: false, error: '' })
    }
    window.addEventListener(AUTH_SESSION_EVENT, handleSessionChange)

    const expiresAt = session?.expires_at ?? 0
    if (session && expiresAt <= Math.floor(Date.now() / 1000) + 60) {
      refreshStoredSession(session).catch((sessionError) => {
        if (active) {
          clearStoredSession()
          setAuthState({
            session: null,
            loading: false,
            error: getApiError(sessionError).message,
          })
        }
      })
    }

    return () => {
      active = false
      window.removeEventListener(AUTH_SESSION_EVENT, handleSessionChange)
    }
  }, [session])

  const setAuthSession = (nextSession) => {
    if (nextSession) saveStoredSession(nextSession)
    else clearStoredSession()
    setAuthState({ session: nextSession, loading: false, error: '' })
  }

  const updateUser = (user) => {
    const currentSession = getStoredSession()
    if (!currentSession) return
    const nextSession = { ...currentSession, user }
    saveStoredSession(nextSession)
    setAuthState({ ...authState, session: nextSession })
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      error,
      setSession: setAuthSession,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
