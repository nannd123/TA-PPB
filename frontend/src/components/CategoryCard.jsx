import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Calculator,
  FlaskConical,
  Globe2,
  Landmark,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categoryIcons = {
  book: BookOpen,
  brain: Brain,
  science: FlaskConical,
  'flask-conical': FlaskConical,
  globe: Globe2,
  'globe-2': Globe2,
  history: Landmark,
  calculator: Calculator,
}

function getCategoryIcon(iconName) {
  const normalizedName = typeof iconName === 'string' ? iconName.toLowerCase() : ''
  const Icon = categoryIcons[normalizedName] || Brain
  return <Icon aria-hidden="true" size={20} />
}

export default function CategoryCard({ category }) {
  return (
    <Link className="category-card" to={`/categories/${category.id}`}>
      <span className="category-icon">{getCategoryIcon(category.icon_name)}</span>
      <strong>{category.name}</strong>
      <small>
        {category.description || 'Jelajahi kuis dalam kategori ini'}
        <ArrowUpRight aria-hidden="true" size={13} />
      </small>
    </Link>
  )
}
