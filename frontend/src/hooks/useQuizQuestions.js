import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getQuizQuestions } from '../services/quizService.js'

export function useQuizQuestions(quizId) {
  const loader = useCallback(() => getQuizQuestions(quizId), [quizId])
  return useApiResource(loader, `quiz-questions:${quizId}`)
}
