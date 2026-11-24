import { BrainCircuit, UserRound } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation.jsx'
import { useAuth } from '../contexts/useAuth.js'

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const isQuizSession = location.pathname.endsWith('/session')

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" to="/" aria-label="Quizora home">
          <span className="brand-mark"><BrainCircuit aria-hidden="true" size={21} /></span>
          <span>Quizora</span>
        </Link>
        {user
          ? (
            <Link className="header-profile" to="/profile" aria-label="Buka profil">
              {user.user_metadata?.avatar_url
                ? <img className="header-profile-avatar" src={user.user_metadata.avatar_url} alt="" />
                : <span className="header-profile-avatar header-profile-placeholder"><UserRound aria-hidden="true" size={16} /></span>}
              <span className="header-tagline">{user.user_metadata?.display_name || user.user_metadata?.username}</span>
            </Link>
          )
          : <span className="header-tagline">DAILY KNOWLEDGE QUIZ</span>}
      </header>
      <main>
        <Outlet />
      </main>
      {!isQuizSession && <BottomNavigation />}
    </div>
  )
}
