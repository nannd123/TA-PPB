import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getQuiz } from '../services/quizService.js'

export function useQuiz(quizId) {
  const loader = useCallback(() => getQuiz(quizId), [quizId])
  return useApiResource(loader, `quiz:${quizId}`)
}
