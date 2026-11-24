import api from '../config/api.js'

export async function getCategories() {
  const response = await api.get('/api/categories')
  return response.data.data
}

export async function getCategoryQuizzes(categoryId) {
  const response = await api.get(`/api/categories/${categoryId}/quizzes`)
  return response.data.data
}
