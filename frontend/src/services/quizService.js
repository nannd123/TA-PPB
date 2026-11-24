import api from '../config/api.js'

export async function getQuizzes(params = {}) {
  const response = await api.get('/api/quizzes', { params })
  return response.data.data
}

export async function getDailyQuiz() {
  const response = await api.get('/api/quizzes/daily')
  return response.data.data
}

export async function getQuiz(quizId) {
  const response = await api.get(`/api/quizzes/${quizId}`)
  return response.data.data
}

export async function getQuizQuestions(quizId) {
  const response = await api.get(`/api/quizzes/${quizId}/questions`)
  return response.data.data
}
