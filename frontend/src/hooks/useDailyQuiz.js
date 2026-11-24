import { useCallback, useEffect } from 'react'
import useApiResource from './useApiResource.js'
import { getDailyQuiz } from '../services/quizService.js'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

function millisecondsUntilJakartaMidnight() {
  const now = new Date()
  const timeParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )
  const elapsedMilliseconds = (
    timeParts.hour * 60 * 60 * 1000
    + timeParts.minute * 60 * 1000
    + timeParts.second * 1000
    + now.getUTCMilliseconds()
  )

  return DAY_IN_MILLISECONDS - elapsedMilliseconds
}

export function useDailyQuiz() {
  const loader = useCallback(() => getDailyQuiz(), [])
  const resource = useApiResource(loader, 'daily-quiz')
  const { retry } = resource

  useEffect(() => {
    let timerId
    const refreshAtNextMidnight = () => {
      timerId = window.setTimeout(() => {
        retry()
        refreshAtNextMidnight()
      }, millisecondsUntilJakartaMidnight())
    }

    refreshAtNextMidnight()
    return () => window.clearTimeout(timerId)
  }, [retry])

  return resource
}
