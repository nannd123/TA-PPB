import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getCategoryQuizzes } from '../services/categoryService.js'

export function useCategoryQuizzes(categoryId) {
  const loader = useCallback(() => getCategoryQuizzes(categoryId), [categoryId])
  return useApiResource(loader, `category-quizzes:${categoryId}`)
}
