import {
  findSubmittedAttempt,
  listAttempts,
  submitAttempt,
} from '../models/attemptModel.js'
import { AppError } from '../utils/appError.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { parsePagination, parseSubmittedAnswers, requireUuid } from '../utils/validation.js'

export async function getAttemptHistory(request, response) {
  const pagination = parsePagination(request.query)
  const result = await listAttempts(request.userId, pagination)

  return sendSuccess(response, 'Quiz history retrieved.', result.items, 200, {
    ...pagination,
    total: result.count,
  })
}

export async function getAttemptResult(request, response) {
  const attemptId = requireUuid(request.params.id, 'attempt id')
  const attempt = await findSubmittedAttempt(attemptId, request.userId)

  if (!attempt) {
    throw new AppError(404, 'Submitted quiz result not found.')
  }

  return sendSuccess(response, 'Quiz result retrieved.', attempt)
}

export async function submitQuizAttempt(request, response) {
  const attemptId = requireUuid(request.params.id, 'attempt id')
  const answers = parseSubmittedAnswers(request.body)
  const result = await submitAttempt(attemptId, request.userId, answers)

  if (!result || typeof result !== 'object' || typeof result.expired !== 'boolean') {
    throw new AppError(502, 'Quiz submission returned an invalid result.')
  }

  if (result.expired) {
    throw new AppError(409, 'Quiz attempt has expired.', { data: result })
  }

  return sendSuccess(response, 'Quiz attempt submitted.', result)
}
