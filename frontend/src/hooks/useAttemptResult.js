import { useCallback } from 'react'
import useApiResource from './useApiResource.js'
import { getAttemptResult } from '../services/attemptService.js'

export function useAttemptResult(attemptId) {
  const loader = useCallback(() => getAttemptResult(attemptId), [attemptId])
  return useApiResource(loader, `attempt-result:${attemptId}`)
}
