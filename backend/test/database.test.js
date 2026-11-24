import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AppError } from '../src/utils/appError.js'
import { unwrapDatabaseResult } from '../src/utils/database.js'

test('database permission errors explain the required Supabase backend key', () => {
  assert.throws(
    () => unwrapDatabaseResult({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied for table categories',
      },
    }),
    (error) => error instanceof AppError
      && error.statusCode === 503
      && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')
      && error.message.includes('publishable/anon key'),
  )
})
