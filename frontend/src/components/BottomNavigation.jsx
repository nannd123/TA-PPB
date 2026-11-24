import { BookOpenCheck, CircleHelp, House, Tags, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/history', label: 'History', icon: BookOpenCheck },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/about', label: 'About', icon: CircleHelp },
]

export default function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Navigasi utama">
      {navigationItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}>
          <Icon aria-hidden="true" size={19} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
