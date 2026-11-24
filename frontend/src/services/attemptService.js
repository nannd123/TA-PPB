import api from '../config/api.js'
import { getUserAuthorization } from './authService.js'

export async function startAttempt(quizId) {
  const headers = await getUserAuthorization()
  const response = await api.post(`/api/quizzes/${quizId}/attempts`, {}, { headers })
  return response.data.data
}

export async function submitAttempt(attemptId, answers) {
  const headers = await getUserAuthorization()
  const response = await api.post(
    `/api/attempts/${attemptId}/submit`,
    { answers },
    { headers },
  )
  return response.data.data
}

export async function getAttemptHistory(params = {}) {
  const headers = await getUserAuthorization()
  const response = await api.get('/api/attempts', { headers, params })
  return response.data.data
}

export async function getAttemptResult(attemptId) {
  const headers = await getUserAuthorization()
  const response = await api.get(`/api/attempts/${attemptId}`, { headers })
  return response.data.data
}
