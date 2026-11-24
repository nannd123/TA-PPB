import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getAttemptHistory } from '../services/attemptService.js'

export function useQuizHistory() {
  const loader = useCallback(() => getAttemptHistory(), [])
  return useApiResource(loader, 'quiz-history')
}
