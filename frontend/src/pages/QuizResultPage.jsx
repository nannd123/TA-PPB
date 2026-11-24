import { ArrowLeft, CircleCheck, CircleX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { useAttemptResult } from '../hooks/useAttemptResult.js'

function getSelectedOptionId(answer) {
  return answer.selected_option_id || null
}

export default function QuizResultPage() {
  const { attemptId } = useParams()
  const { data: attempt, error, loading, retry } = useAttemptResult(attemptId)

  if (loading) {
    return <div className="page-container"><LoadingState label="Memuat hasil kuis..." /></div>
  }
  if (error) {
    return (
      <div className="page-container">
        <PageHeading eyebrow="HASIL KUIS" title="Hasil tidak dapat dimuat" />
        <ErrorState error={error} onRetry={retry} />
      </div>
    )
  }

  const score = Math.round(Number(attempt.score) || 0)
  const answers = [...(attempt.answers || [])].sort(
    (first, second) => (first.question?.order_number || 0) - (second.question?.order_number || 0),
  )

  return (
    <div className="page-container">
      <PageHeading eyebrow="SELESAI" title="Hasil kuis" description={attempt.quiz?.title || 'Kuis'} />
      <section className="result-hero" aria-label="Ringkasan nilai">
        <div className="score-circle">{score}%</div>
        <div>
          <p className="eyebrow">SKOR AKHIR</p>
          <h2>{score >= 80 ? 'Luar biasa!' : score >= 60 ? 'Kerja bagus!' : 'Tetap semangat!'}</h2>
          <p>{attempt.correct_count} jawaban benar dari {attempt.total_questions} pertanyaan.</p>
        </div>
      </section>
      <div className="result-summary">
        <span>{attempt.quiz?.category?.name || 'Kuis'}</span>
        <span>{attempt.duration_seconds ?? 0} detik</span>
        {attempt.submitted_at && (
          <span>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(attempt.submitted_at))}</span>
        )}
      </div>
      <section className="section" aria-labelledby="review-title">
        <div className="section-heading">
          <h2 id="review-title">Pembahasan jawaban</h2>
          <Link className="text-link" to="/history"><ArrowLeft aria-hidden="true" size={15} /> Riwayat</Link>
        </div>
        {answers.length === 0 ? (
          <EmptyState title="Pembahasan tidak tersedia" description="Tidak ada detail jawaban pada hasil ini." />
        ) : answers.map((answer, index) => {
          const question = answer.question
          if (!question) {
            return null
          }
          const selectedOptionId = getSelectedOptionId(answer)
          return (
            <article className="question-card" key={answer.question_id}>
              <div className="question-top">
                <span>Pertanyaan {index + 1}</span>
                <span>{answer.is_correct ? 'Benar' : 'Belum tepat'}</span>
              </div>
              <h3 className="question-text">{question.question_text}</h3>
              <div>
                {question.options.map((option) => {
                  const isSelected = option.id === selectedOptionId
                  const isCorrect = option.is_correct
                  const className = isCorrect ? 'correct' : isSelected ? 'incorrect' : ''
                  return (
                    <div className={`review-option ${className}`} key={option.id}>
                      {isCorrect
                        ? <CircleCheck aria-hidden="true" size={16} />
                        : isSelected
                          ? <CircleX aria-hidden="true" size={16} />
                          : <span className="option-label">{option.option_label}</span>}
                      <span>{option.option_text}{isSelected && !isCorrect ? ' · Jawabanmu' : ''}</span>
                    </div>
                  )
                })}
              </div>
              {question.explanation && <p className="page-description">{question.explanation}</p>}
            </article>
          )
        })}
      </section>
    </div>
  )
}
