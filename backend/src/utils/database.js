import { AppError } from './appError.js'

export function unwrapDatabaseResult(result, message = 'Database request failed.') {
  if (result.error) {
    if (result.error.code === '23505') {
      throw new AppError(409, 'An active attempt already exists for this quiz.', {
        cause: result.error,
      })
    }

    if (result.error.code === '42501') {
      throw new AppError(
        503,
        'Supabase denied database access. Check that SUPABASE_SERVICE_ROLE_KEY is the project service_role/secret key, not a publishable/anon key, and that the database schema is configured.',
        { cause: result.error },
      )
    }

    throw new AppError(502, message, { cause: result.error })
  }

  return result.data
}

export function mapSubmitError(error) {
  const knownErrors = {
    '22023': [400, 'Answers are invalid or reference questions/options outside this quiz.'],
    'P0002': [404, 'Quiz attempt not found.'],
    '23505': [409, 'This quiz already has an active attempt.'],
    '55000': [409, 'This attempt cannot be submitted or has expired.'],
  }
  const [statusCode, message] = knownErrors[error.code] ?? [502, 'Quiz submission failed.']

  throw new AppError(statusCode, message, { cause: error })
}
