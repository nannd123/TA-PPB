import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { useQuizHistory } from '../hooks/useQuizHistory.js'

function formatDate(value) {
  if (!value) {
    return 'Tanggal tidak tersedia'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Tanggal tidak tersedia'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function QuizHistoryPage() {
  const { data: history, error, loading, retry } = useQuizHistory()

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="PERJALANAN BELAJARMU"
        title="Riwayat kuis"
        description="Lihat kembali kuis yang sudah kamu selesaikan dan hasilnya."
      />
      {loading && <LoadingState label="Memuat riwayat kuis..." />}
      {!loading && error && <ErrorState error={error} onRetry={retry} />}
      {!loading && !error && history?.length === 0 && (
        <EmptyState
          title="Riwayatmu masih kosong"
          description="Kuis yang sudah dikumpulkan akan muncul di sini."
        >
          <Link className="primary-button" to="/categories">Cari kuis</Link>
        </EmptyState>
      )}
      {!loading && !error && history?.length > 0 && (
        <div className="history-list">
          {history.map((attempt) => (
            <Link className="history-card" key={attempt.id} to={`/attempts/${attempt.id}`}>
              <div>
                <h3>{attempt.quiz?.title || 'Kuis'}</h3>
                <p>{attempt.quiz?.category?.name || 'Kategori'} · {formatDate(attempt.submitted_at)}</p>
                <p>
                  {attempt.correct_count}/{attempt.total_questions} benar ·{' '}
                  <Clock3 aria-hidden="true" size={12} /> {attempt.duration_seconds ?? 0} detik
                </p>
              </div>
              <div className="history-meta">
                <span className="history-score">{Math.round(Number(attempt.score) || 0)}%</span>
                <ArrowRight aria-hidden="true" size={16} color="#888f9d" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
