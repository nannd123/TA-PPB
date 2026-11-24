import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getQuizzes } from '../services/quizService.js'

export function useQuizzes(params = {}) {
  const { category_id: categoryId, difficulty, limit, offset } = params
  const loader = useCallback(
    () => getQuizzes({ category_id: categoryId, difficulty, limit, offset }),
    [categoryId, difficulty, limit, offset],
  )
  const key = `quizzes:${categoryId || ''}:${difficulty || ''}:${limit || ''}:${offset || ''}`
  return useApiResource(loader, key)
}
