import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from './AsyncState.jsx'
import { useAuth } from '../contexts/useAuth.js'

export default function RequireAuth({ children }) {
  const { session, loading, error } = useAuth()
  const location = useLocation()

  if (loading) {
    return <main className="page-container"><LoadingState label="Memeriksa sesi akun..." /></main>
  }
  if (error) {
    return <main className="page-container"><div className="error-banner" role="alert">{error}</div></main>
  }
  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return children
}
