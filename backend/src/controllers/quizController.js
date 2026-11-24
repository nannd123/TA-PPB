import {
  findDailyQuiz,
  findPublishedQuizById,
  findPublishedQuizForAttempt,
  listQuizQuestions,
  listQuizzes,
} from '../models/quizModel.js'
import { createOrResumeAttempt } from '../models/attemptModel.js'
import { AppError } from '../utils/appError.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { getJakartaDate } from '../utils/jakartaDate.js'
import { ensureDailyQuizScheduled } from '../services/dailyQuizScheduler.js'
import { parseQuizFilters, requireUuid } from '../utils/validation.js'

export async function getQuizzes(request, response) {
  const filters = parseQuizFilters(request.query)
  const result = await listQuizzes(filters)
  return sendSuccess(response, 'Quizzes retrieved.', result.items, 200, {
    limit: filters.limit,
    offset: filters.offset,
    total: result.count,
  })
}

export async function getDailyQuiz(_request, response) {
  const today = getJakartaDate()
  const schedule = await ensureDailyQuizScheduled(today)

  if (!schedule) {
    throw new AppError(404, 'No published daily quiz is available today.')
  }

  const quiz = await findDailyQuiz(today)
  if (!quiz || quiz.question_count !== 5) {
    throw new AppError(404, 'No published daily quiz is available today.')
  }

  return sendSuccess(response, 'Daily quiz retrieved.', quiz)
}

export async function getQuiz(request, response) {
  const quizId = requireUuid(request.params.id, 'quiz id')
  const quiz = await findPublishedQuizById(quizId)

  if (!quiz) {
    throw new AppError(404, 'Quiz not found.')
  }

  return sendSuccess(response, 'Quiz retrieved.', quiz)
}

export async function getQuizQuestions(request, response) {
  const quizId = requireUuid(request.params.id, 'quiz id')
  const quiz = await findPublishedQuizById(quizId)

  if (!quiz) {
    throw new AppError(404, 'Quiz not found.')
  }

  const questions = await listQuizQuestions(quizId)
  return sendSuccess(response, 'Quiz questions retrieved.', questions)
}

export async function startQuizAttempt(request, response) {
  const quizId = requireUuid(request.params.id, 'quiz id')
  const quiz = await findPublishedQuizForAttempt(quizId)

  if (!quiz) {
    throw new AppError(404, 'Quiz not found.')
  }

  if ((quiz.questions?.[0]?.count ?? 0) === 0) {
    throw new AppError(409, 'This quiz does not have any questions yet.')
  }

  const { attempt, resumed } = await createOrResumeAttempt(quizId, request.userId)
  return sendSuccess(
    response,
    resumed ? 'Active quiz attempt resumed.' : 'Quiz attempt started.',
    attempt,
    resumed ? 200 : 201,
  )
}
