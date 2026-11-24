import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ensureDailyQuizScheduled } from '../src/services/dailyQuizScheduler.js'
import { getJakartaDate } from '../src/utils/jakartaDate.js'

test('Jakarta calendar date changes at midnight WIB, not UTC midnight', () => {
  assert.equal(getJakartaDate(new Date('2026-11-21T16:59:59.999Z')), '2026-11-21')
  assert.equal(getJakartaDate(new Date('2026-11-21T17:00:00.000Z')), '2026-11-22')
})

test('daily schedule uses the atomic database function and returns its assignment', async () => {
  const expectedSchedule = {
    id: 'schedule-id',
    scheduled_date: '2026-11-22',
    quiz_id: 'quiz-id',
  }
  const calls = []
  const client = {
    async rpc(name, parameters) {
      calls.push({ name, parameters })
      return { data: [expectedSchedule], error: null }
    },
  }

  assert.deepEqual(await ensureDailyQuizScheduled('2026-11-22', client), expectedSchedule)
  assert.deepEqual(calls, [{
    name: 'ensure_daily_quiz_scheduled',
    parameters: { p_scheduled_date: '2026-11-22' },
  }])
})

test('daily schedule returns no assignment when the bank has no eligible package', async () => {
  const client = {
    async rpc() {
      return { data: [], error: null }
    },
  }

  assert.equal(await ensureDailyQuizScheduled('2026-11-22', client), null)
})

test('concurrent lazy requests for the same date converge on one persisted assignment', async () => {
  const date = '2026-11-22'
  let transaction = Promise.resolve()
  let persistedSchedule = null
  let insertCount = 0
  let callCount = 0
  const client = {
    async rpc(name, parameters) {
      assert.equal(name, 'ensure_daily_quiz_scheduled')
      assert.equal(parameters.p_scheduled_date, date)
      callCount += 1

      const previousTransaction = transaction
      let releaseTransaction
      transaction = new Promise((resolve) => {
        releaseTransaction = resolve
      })
      await previousTransaction

      try {
        await new Promise((resolve) => setImmediate(resolve))
        if (!persistedSchedule) {
          insertCount += 1
          persistedSchedule = {
            id: 'one-schedule',
            scheduled_date: date,
            quiz_id: 'one-quiz',
          }
        }

        return { data: [persistedSchedule], error: null }
      } finally {
        releaseTransaction()
      }
    },
  }

  const schedules = await Promise.all(
    Array.from({ length: 20 }, () => ensureDailyQuizScheduled(date, client)),
  )

  assert.equal(callCount, 20)
  assert.equal(insertCount, 1)
  assert.ok(schedules.every((schedule) => schedule.id === 'one-schedule'))
})
