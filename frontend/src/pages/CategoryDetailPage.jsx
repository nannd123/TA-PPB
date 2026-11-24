import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import QuizCard from '../components/QuizCard.jsx'
import { useCategoryQuizzes } from '../hooks/useCategoryQuizzes.js'

export default function CategoryDetailPage() {
  const { categoryId } = useParams()
  const { data, error, loading, retry } = useCategoryQuizzes(categoryId)

  if (loading) {
    return <div className="page-container"><LoadingState label="Memuat kategori dan kuis..." /></div>
  }
  if (error) {
    return (
      <div className="page-container">
        <PageHeading eyebrow="KATEGORI" title="Kategori tidak dapat dimuat" />
        <ErrorState error={error} onRetry={retry} />
      </div>
    )
  }

  return (
    <div className="page-container">
      <Link className="text-link" to="/categories"><ArrowLeft aria-hidden="true" size={15} /> Semua kategori</Link>
      <PageHeading
        eyebrow="KATEGORI"
        title={data.category.name}
        description={data.category.description || 'Pilih salah satu kuis untuk mulai bermain.'}
      />
      {data.quizzes.length === 0 ? (
        <EmptyState
          title="Belum ada kuis dalam kategori ini"
          description="Kuis baru akan muncul di sini saat tersedia."
        />
      ) : (
        <div className="card-grid quiz-grid">
          {data.quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}
        </div>
      )}
    </div>
  )
}
