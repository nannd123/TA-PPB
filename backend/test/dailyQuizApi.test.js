import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { getJakartaDate } from '../src/utils/jakartaDate.js'

const originalFetch = globalThis.fetch
const schedule = {
  id: 'schedule-id',
  scheduled_date: getJakartaDate(),
  quiz_id: 'quiz-id',
  created_at: '2026-11-22T00:00:00.000Z',
}
let scheduleAvailable = true
let requestedScheduleDate

process.env.SUPABASE_URL = 'https://lazy-scheduler.example.test'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input)
  if (url.host !== 'lazy-scheduler.example.test') {
    return originalFetch(input, init)
  }

  if (url.pathname === '/rest/v1/rpc/ensure_daily_quiz_scheduled') {
    requestedScheduleDate = JSON.parse(init.body).p_scheduled_date
    return Response.json(scheduleAvailable ? [schedule] : [])
  }

  if (url.pathname === '/rest/v1/daily_quiz_schedule') {
    return Response.json({
      scheduled_date: schedule.scheduled_date,
      quiz: {
        id: schedule.quiz_id,
        category_id: 'category-id',
        title: 'Daily Quiz',
        description: 'Quiz for today.',
        difficulty: 'medium',
        duration_seconds: 300,
        created_at: schedule.created_at,
        category: { id: 'category-id', name: 'Sains', slug: 'sains', icon_name: 'flask-conical' },
        questions: [{ count: 5 }],
      },
    })
  }

  throw new Error(`Unexpected Supabase request: ${url.pathname}`)
}

const { default: app } = await import('../src/app.js')
let server
let baseUrl

before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })

  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  globalThis.fetch = originalFetch
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
  }
})

test('daily quiz API lazily schedules and returns the shared five-question assignment', async () => {
  const response = await originalFetch(`${baseUrl}/api/quizzes/daily`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(requestedScheduleDate, getJakartaDate())
  assert.equal(body.data.scheduled_date, requestedScheduleDate)
  assert.equal(body.data.id, schedule.quiz_id)
  assert.equal(body.data.question_count, 5)
})

test('daily quiz API returns an informative empty state when no valid package exists', async () => {
  scheduleAvailable = false
  const response = await originalFetch(`${baseUrl}/api/quizzes/daily`)
  const body = await response.json()

  assert.equal(response.status, 404)
  assert.match(body.message, /tepat lima pertanyaan valid/)
})
