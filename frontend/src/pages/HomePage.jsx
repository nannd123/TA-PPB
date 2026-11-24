import { ArrowRight, BrainCircuit, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import QuizCard from '../components/QuizCard.jsx'
import { useCategories } from '../hooks/useCategories.js'
import { useDailyQuiz } from '../hooks/useDailyQuiz.js'
import { useQuizzes } from '../hooks/useQuizzes.js'

function DailyQuizSection() {
  const { data: quiz, error, loading, retry } = useDailyQuiz()

  return (
    <section className="section" aria-labelledby="daily-title">
      <div className="section-heading">
        <h2 id="daily-title">Kuis harian</h2>
      </div>
      {loading && <LoadingState label="Mencari kuis harian..." />}
      {!loading && error?.status === 404 && (
        <EmptyState
          title="Kuis harian belum tersedia"
          description="Kuis harian baru akan muncul di sini saat tersedia."
        />
      )}
      {!loading && error && error.status !== 404 && <ErrorState error={error} onRetry={retry} />}
      {!loading && !error && quiz && (
        <div className="daily-card">
          <div>
            <p className="eyebrow">TANTANGAN HARI INI</p>
            <h3>{quiz.title}</h3>
            <p className="daily-question-count">
              <HelpCircle aria-hidden="true" size={14} /> {quiz.question_count} pertanyaan
            </p>
            <p>{quiz.description || 'Satu kuis singkat untuk menambah wawasanmu.'}</p>
          </div>
          <Link className="primary-button" to={`/quizzes/${quiz.id}`}>
            Mulai kuis <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      )}
    </section>
  )
}

export default function HomePage() {
  const { data: categories, error: categoriesError, loading: categoriesLoading, retry: retryCategories } = useCategories()
  const { data: quizzes, error: quizzesError, loading: quizzesLoading, retry: retryQuizzes } = useQuizzes({ limit: 4 })

  return (
    <div className="page-container">
      <section className="hero" aria-labelledby="welcome-title">
        <div>
          <p className="eyebrow">BELAJAR SEDIKIT, SETIAP HARI</p>
          <h1 id="welcome-title">Asah pengetahuanmu bersama Quizora.</h1>
          <p className="hero-description">
            Tantang dirimu dengan kuis singkat dan temukan hal baru setiap hari.
          </p>
          <Link className="primary-button" to="/categories">
            Jelajahi kategori <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-art-badge"><BrainCircuit size={68} /></span>
        </div>
      </section>

      <DailyQuizSection />

      <section className="section" aria-labelledby="categories-title">
        <div className="section-heading">
          <h2 id="categories-title">Jelajahi kategori</h2>
          <Link className="text-link" to="/categories">
            Lihat semua <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        {categoriesLoading && <LoadingState label="Memuat kategori..." />}
        {!categoriesLoading && categoriesError && (
          <ErrorState error={categoriesError} onRetry={retryCategories} />
        )}
        {!categoriesLoading && !categoriesError && categories?.length === 0 && (
          <EmptyState
            title="Belum ada kategori"
            description="Kategori kuis akan ditampilkan di sini setelah tersedia."
          />
        )}
        {!categoriesLoading && !categoriesError && categories?.length > 0 && (
          <div className="card-grid">
            {categories.slice(0, 3).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="quizzes-title">
        <div className="section-heading">
          <h2 id="quizzes-title">Kuis terbaru</h2>
          <Link className="text-link" to="/categories">
            Cari kuis <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        {quizzesLoading && <LoadingState label="Memuat kuis..." />}
        {!quizzesLoading && quizzesError && <ErrorState error={quizzesError} onRetry={retryQuizzes} />}
        {!quizzesLoading && !quizzesError && quizzes?.length === 0 && (
          <EmptyState
            title="Belum ada kuis"
            description="Kuis yang tersedia akan muncul di halaman ini."
          />
        )}
        {!quizzesLoading && !quizzesError && quizzes?.length > 0 && (
          <div className="card-grid quiz-grid">
            {quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}
          </div>
        )}
      </section>
    </div>
  )
}
