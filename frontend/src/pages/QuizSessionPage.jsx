import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/AsyncState.jsx'
import { getQuiz, getQuizQuestions } from '../services/quizService.js'
import { startAttempt, submitAttempt } from '../services/attemptService.js'
import { getApiError } from '../utils/apiError.js'

async function loadQuizSession(quizId) {
  const quiz = await getQuiz(quizId)
  const questions = await getQuizQuestions(quizId)
  const attempt = await startAttempt(quizId)
  return { quiz, questions, attempt }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export default function QuizSessionPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [revision, setRevision] = useState(0)
  const [sessionState, setSessionState] = useState({ key: null, revision: -1, data: null, error: null })
  const [answers, setAnswers] = useState({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [now, setNow] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [expired, setExpired] = useState(false)
  const submittedRef = useRef(false)
  const submittingRef = useRef(false)
  const resourceKey = `quiz-session:${quizId}`

  useEffect(() => {
    let active = true
    loadQuizSession(quizId)
      .then((data) => {
        if (active) {
          setSessionState({ key: resourceKey, revision, data, error: null })
        }
      })
      .catch((error) => {
        if (active) {
          setSessionState({ key: resourceKey, revision, data: null, error: getApiError(error) })
        }
      })
    return () => {
      active = false
    }
  }, [quizId, resourceKey, revision])

  const isCurrent = sessionState.key === resourceKey && sessionState.revision === revision
  const session = isCurrent ? sessionState.data : null
  const loadError = isCurrent ? sessionState.error : null
  const loading = !isCurrent
  const questions = session?.questions || []
  const safeQuestionIndex = Math.min(questionIndex, Math.max(questions.length - 1, 0))
  const question = questions[safeQuestionIndex]
  const durationSeconds = Number(session?.quiz.duration_seconds || 0)
  const startedAt = session?.attempt.started_at ? Date.parse(session.attempt.started_at) : now
  const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000))
  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds)

  useEffect(() => {
    if (!session) {
      return undefined
    }
    const initialTimerId = window.setTimeout(() => setNow(Date.now()), 0)
    const timerId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      window.clearTimeout(initialTimerId)
      window.clearInterval(timerId)
    }
  }, [session])

  const handleSubmit = useCallback(async () => {
    if (!session || submittingRef.current || submittedRef.current) {
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      const submittedAnswers = session.questions.map((item) => ({
        question_id: item.id,
        selected_option_id: answers[item.id] || null,
      }))
      await submitAttempt(session.attempt.id, submittedAnswers)
      submittedRef.current = true
      navigate(`/attempts/${session.attempt.id}`, { replace: true })
    } catch (error) {
      const apiError = getApiError(error)
      if (apiError.status === 409 && apiError.data?.expired) {
        setExpired(true)
      } else {
        setSubmitError(apiError.message)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [answers, navigate, session])

  useEffect(() => {
    if (session && remainingSeconds === 0 && !expired && !submittedRef.current) {
      void handleSubmit()
    }
  }, [expired, handleSubmit, remainingSeconds, session])

  const retryLoad = () => setRevision((value) => value + 1)

  if (loading) {
    return <div className="page-container"><LoadingState label="Menyiapkan sesi kuis..." /></div>
  }
  if (loadError) {
    return (
      <div className="page-container">
        <Link className="text-link" to={`/quizzes/${quizId}`}><ArrowLeft aria-hidden="true" size={15} /> Kembali ke detail kuis</Link>
        <div className="section"><ErrorState error={loadError} onRetry={retryLoad} /></div>
      </div>
    )
  }
  if (expired) {
    return (
      <div className="page-container">
        <div className="state-card" role="alert">
          <Clock3 aria-hidden="true" size={22} />
          <strong>Waktu kuis telah habis</strong>
          <p>Attempt ini telah kedaluwarsa dan tidak dapat dinilai.</p>
          <Link className="secondary-button" to={`/quizzes/${quizId}`}>Kembali ke kuis</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="session-toolbar">
        <div>
          <p className="eyebrow">SEDANG MENGERJAKAN</p>
          <h1>{session.quiz.title}</h1>
        </div>
        <span className={`timer ${remainingSeconds <= 30 ? 'low-time' : ''}`} role="timer" aria-live="polite">
          <Clock3 aria-hidden="true" size={16} /> {formatTime(remainingSeconds)}
        </span>
      </div>
      {question && (
        <section className="question-card" aria-label={`Pertanyaan ${safeQuestionIndex + 1}`}>
          <div className="question-top">
            <span>Pertanyaan {safeQuestionIndex + 1} dari {questions.length}</span>
            <span>{question.points} poin</span>
          </div>
          <div
            className="question-progress"
            role="progressbar"
            aria-valuenow={safeQuestionIndex + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
          >
            <span style={{ width: `${((safeQuestionIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <h2 className="question-text">{question.question_text}</h2>
          <div className="answer-list" role="radiogroup" aria-label="Pilihan jawaban">
            {question.answer_options.map((option) => (
              <button
                key={option.id}
                className={`answer-option ${answers[question.id] === option.id ? 'selected' : ''}`}
                type="button"
                role="radio"
                aria-checked={answers[question.id] === option.id}
                onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
              >
                <span className="option-label">{option.option_label}</span>
                <span>{option.option_text}</span>
              </button>
            ))}
          </div>
          <div className="session-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={safeQuestionIndex === 0 || submitting}
              onClick={() => setQuestionIndex((index) => Math.max(index - 1, 0))}
            >
              <ArrowLeft aria-hidden="true" size={15} /> Sebelumnya
            </button>
            <span>{Object.keys(answers).length} dari {questions.length} dijawab</span>
            {safeQuestionIndex < questions.length - 1 ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => setQuestionIndex((index) => Math.min(index + 1, questions.length - 1))}
              >
                Berikutnya <ArrowRight aria-hidden="true" size={15} />
              </button>
            ) : (
              <button className="primary-button" type="button" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Mengirim...' : 'Kumpulkan kuis'}
              </button>
            )}
          </div>
          {submitError && (
            <div className="error-banner" role="alert">
              <span>{submitError}</span>
              <button className="secondary-button" type="button" disabled={submitting} onClick={handleSubmit}>
                Coba lagi
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
