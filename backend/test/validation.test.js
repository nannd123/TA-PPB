import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AppError } from '../src/utils/appError.js'
import {
  parseAuthCredentials,
  parseProfileUpdates,
  parseSubmittedAnswers,
  requireUuid,
} from '../src/utils/validation.js'

const questionId = '00000000-0000-4000-8000-000000000201'
const optionId = '00000000-0000-4000-8000-000000000302'

test('auth credentials normalize usernames and preserve passwords', () => {
  assert.deepEqual(parseAuthCredentials({ username: ' Learner_1 ', password: 'secret1' }), {
    username: 'learner_1',
    password: 'secret1',
  })
})

test('auth credentials reject invalid usernames and short passwords', () => {
  assert.throws(
    () => parseAuthCredentials({ username: 'has space', password: 'secret1' }),
    (error) => error instanceof AppError && error.statusCode === 400,
  )
  assert.throws(
    () => parseAuthCredentials({ username: 'learner', password: 'short' }),
    (error) => error instanceof AppError && error.statusCode === 400,
  )
})

test('profile updates normalize usernames and accept display-name-only updates', () => {
  assert.deepEqual(parseProfileUpdates({ display_name: 'Learner', username: ' Learner_2 ' }), {
    displayName: 'Learner',
    username: 'learner_2',
  })
  assert.deepEqual(parseProfileUpdates({ display_name: 'Learner' }), {
    displayName: 'Learner',
  })
})

test('profile updates reject invalid usernames', () => {
  assert.throws(
    () => parseProfileUpdates({ display_name: 'Learner', username: 'not valid' }),
    (error) => error instanceof AppError && error.statusCode === 400,
  )
})

test('submitted answers accept omitted choices and discard client-supplied scores', () => {
  assert.deepEqual(parseSubmittedAnswers({
    score: 100,
    answers: [
      { question_id: questionId, selected_option_id: optionId },
      { question_id: '00000000-0000-4000-8000-000000000202' },
    ],
  }), [
    { question_id: questionId, selected_option_id: optionId },
    {
      question_id: '00000000-0000-4000-8000-000000000202',
      selected_option_id: null,
    },
  ])
})

test('submitted answers reject duplicate questions', () => {
  assert.throws(
    () => parseSubmittedAnswers({
      answers: [
        { question_id: questionId },
        { question_id: questionId },
      ],
    }),
    (error) => error instanceof AppError && error.statusCode === 400,
  )
})

test('UUID validation rejects malformed identifiers', () => {
  assert.throws(
    () => requireUuid('not-a-uuid'),
    (error) => error instanceof AppError && error.statusCode === 400,
  )
})
