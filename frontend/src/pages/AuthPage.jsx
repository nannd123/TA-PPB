import { useState } from 'react'
import { BrainCircuit, LogIn, UserPlus } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth.js'
import { getApiError } from '../utils/apiError.js'
import { registerWithUsername, signInWithUsername } from '../services/authService.js'

export default function AuthPage() {
  const { session, setSession } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const normalizedUsername = username.trim().toLowerCase()

      const nextSession = mode === 'register'
        ? await registerWithUsername(normalizedUsername, password)
        : await signInWithUsername(normalizedUsername, password)
      setSession(nextSession)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (authError) {
      setError(getApiError(authError).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand-mark"><BrainCircuit aria-hidden="true" size={22} /></span>
          <span>Quizora</span>
        </div>
        <p className="eyebrow">BELAJAR SETIAP HARI</p>
        <h1 id="auth-title">{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun Quizora'}</h1>
        <p className="auth-description">
          {mode === 'login'
            ? 'Masuk untuk melanjutkan perjalanan belajarmu.'
            : 'Daftar untuk menyimpan progres belajar di akunmu.'}
        </p>
        <div className="auth-tabs" role="group" aria-label="Pilih jenis autentikasi">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(''); setMessage('') }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(''); setMessage('') }}
          >
            Daftar
          </button>
        </div>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {message && <div className="success-banner" role="status">{message}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label>
            Nama pengguna
            <input
              autoCapitalize="none"
              autoComplete="username"
              maxLength={30}
              minLength={3}
              onChange={(event) => setUsername(event.target.value)}
              pattern="[a-zA-Z0-9_]{3,30}"
              required
              spellCheck="false"
              title="Gunakan 3-30 huruf, angka, atau garis bawah."
              value={username}
            />
          </label>
          <label>
            Kata sandi
            <input
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button className="primary-button auth-submit" disabled={submitting} type="submit">
            {mode === 'login'
              ? <><LogIn aria-hidden="true" size={16} /> Masuk</>
              : <><UserPlus aria-hidden="true" size={16} /> Buat akun</>}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}
          >
            {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </p>
      </section>
    </main>
  )
}
