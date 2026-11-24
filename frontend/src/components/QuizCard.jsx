import { ArrowRight, Clock3, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatQuizDuration } from '../utils/formatQuizDuration.js'

const difficultyLabels = {
  easy: 'Mudah',
  medium: 'Menengah',
  hard: 'Sulit',
}

export default function QuizCard({ quiz }) {
  return (
    <Link className="quiz-card" to={`/quizzes/${quiz.id}`}>
      <div className="quiz-card-top">
        <span className="difficulty">{difficultyLabels[quiz.difficulty] || quiz.difficulty}</span>
        <ArrowRight aria-hidden="true" size={17} color="#8b91a0" />
      </div>
      <h3>{quiz.title}</h3>
      <p>{quiz.description || 'Uji pemahamanmu dalam kuis ini.'}</p>
      <div className="quiz-meta">
        {quiz.category?.name && <span>{quiz.category.name}</span>}
        <span><HelpCircle aria-hidden="true" size={13} /> {quiz.question_count} soal</span>
        <span><Clock3 aria-hidden="true" size={13} /> {formatQuizDuration(quiz.duration_seconds)}</span>
      </div>
    </Link>
  )
}
