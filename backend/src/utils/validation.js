import { AppError } from './appError.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/

export function parseUsername(value) {
  const username = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!USERNAME_PATTERN.test(username)) {
    throw new AppError(400, 'Username must be 3-30 letters, numbers, or underscores.')
  }

  return username
}

export function parseAuthCredentials(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'Username and password are required.')
  }

  const username = parseUsername(body.username)
  if (typeof body.password !== 'string' || body.password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters.')
  }

  return { username, password: body.password }
}

export function parseDisplayName(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'A display name is required.')
  }

  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : ''
  if (!displayName || displayName.length > 60) {
    throw new AppError(400, 'Display name must be between 1 and 60 characters.')
  }

  return displayName
}

export function parseProfileUpdates(body) {
  const displayName = parseDisplayName(body)
  const updates = { displayName }

  if (Object.hasOwn(body, 'username')) {
    updates.username = parseUsername(body.username)
  }

  return updates
}

export function requireUuid(value, fieldName = 'id') {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new AppError(400, `${fieldName} must be a valid UUID.`)
  }

  return value
}

function parseInteger(value, defaultValue, fieldName, maximum) {
  if (value === undefined) {
    return defaultValue
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError(400, `${fieldName} must be a non-negative integer.`)
  }

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new AppError(400, `${fieldName} must not exceed ${maximum}.`)
  }

  return parsed
}

export function parsePagination(query) {
  const limit = parseInteger(query.limit, 20, 'limit', 50)
  const offset = parseInteger(query.offset, 0, 'offset', 5000)

  if (limit < 1) {
    throw new AppError(400, 'limit must be at least 1.')
  }

  return { limit, offset }
}

export function parseQuizFilters(query) {
  const filters = parsePagination(query)

  if (query.category_id !== undefined) {
    filters.categoryId = requireUuid(query.category_id, 'category_id')
  }

  if (query.difficulty !== undefined) {
    if (!DIFFICULTIES.has(query.difficulty)) {
      throw new AppError(400, 'difficulty must be easy, medium, or hard.')
    }

    filters.difficulty = query.difficulty
  }

  return filters
}

export function parseSubmittedAnswers(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.answers)) {
    throw new AppError(400, 'Request body must contain an answers array.')
  }

  if (body.answers.length > 500) {
    throw new AppError(400, 'An attempt cannot contain more than 500 answers.')
  }

  const seenQuestionIds = new Set()
  return body.answers.map((answer, index) => {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      throw new AppError(400, `answers[${index}] must be an object.`)
    }

    const questionId = requireUuid(answer.question_id, `answers[${index}].question_id`)
    const selectedOptionId = answer.selected_option_id ?? null

    if (selectedOptionId !== null) {
      requireUuid(selectedOptionId, `answers[${index}].selected_option_id`)
    }

    if (seenQuestionIds.has(questionId)) {
      throw new AppError(400, `Question ${questionId} appears more than once.`)
    }

    seenQuestionIds.add(questionId)
    return {
      question_id: questionId,
      selected_option_id: selectedOptionId,
    }
  })
}
