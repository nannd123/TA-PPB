import { ArrowLeft, ArrowRight, Clock3, HelpCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/AsyncState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { useQuiz } from '../hooks/useQuiz.js'
import { formatQuizDuration } from '../utils/formatQuizDuration.js'

const difficultyLabels = {
  easy: 'Mudah',
  medium: 'Menengah',
  hard: 'Sulit',
}

export default function QuizDetailPage() {
  const { quizId } = useParams()
  const { data: quiz, error, loading, retry } = useQuiz(quizId)

  if (loading) {
    return <div className="page-container"><LoadingState label="Memuat detail kuis..." /></div>
  }
  if (error) {
    return (
      <div className="page-container">
        <PageHeading eyebrow="DETAIL KUIS" title="Kuis tidak dapat dimuat" />
        <ErrorState error={error} onRetry={retry} />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Link className="text-link" to={quiz.category?.id ? `/categories/${quiz.category.id}` : '/categories'}>
        <ArrowLeft aria-hidden="true" size={15} />
        {quiz.category?.name || 'Semua kategori'}
      </Link>
      <PageHeading
        eyebrow={quiz.category?.name || 'KUIS'}
        title={quiz.title}
        description={quiz.description || 'Siap menguji pengetahuanmu?'}
      />
      <div className="detail-layout">
        <section className="panel-card detail-card">
          <h2>Tentang kuis</h2>
          <p>{quiz.description || 'Jawab pertanyaan sebaik mungkin sebelum waktu habis.'}</p>
          <div className="detail-stats">
            <div className="detail-stat"><HelpCircle aria-hidden="true" size={18} /> {quiz.question_count} pertanyaan</div>
            <div className="detail-stat"><Clock3 aria-hidden="true" size={18} /> {formatQuizDuration(quiz.duration_seconds)}</div>
            <div className="detail-stat"><span className="difficulty">{difficultyLabels[quiz.difficulty] || quiz.difficulty}</span></div>
          </div>
          <Link className="primary-button" to={`/quiz/${quiz.id}/session`}>
            Mulai kuis <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </section>
        <aside className="panel-card">
          <h2>Petunjuk</h2>
          <p>Waktu mulai dihitung saat sesi dibuka. Pilihan jawaban dikirim ke server saat kuis dikumpulkan.</p>
        </aside>
      </div>
    </div>
  )
}
