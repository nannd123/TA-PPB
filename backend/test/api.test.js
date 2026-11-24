import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

delete process.env.SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY

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
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
  }
})

test('health endpoint returns the standard success envelope', async () => {
  const response = await fetch(`${baseUrl}/health`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.success, true)
  assert.equal(body.data.service, 'quizora-api')
})

test('username registration route reports missing backend Supabase configuration', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'learner', password: 'secret1' }),
  })
  const body = await response.json()

  assert.equal(response.status, 503)
  assert.equal(body.success, false)
  assert.equal(body.message, 'Database service is not configured.')
})

test('attempt routes require a Supabase user access token', async () => {
  const response = await fetch(`${baseUrl}/api/attempts/not-a-uuid`)
  const body = await response.json()

  assert.equal(response.status, 401)
  assert.equal(body.success, false)
  assert.match(body.message, /user access token/)
})

test('guest identities can no longer be created', async () => {
  const response = await fetch(`${baseUrl}/api/guest`, { method: 'POST' })

  assert.equal(response.status, 404)
})

test('legacy guest tokens are rejected as user credentials', async () => {
  const response = await fetch(`${baseUrl}/api/attempts/not-a-uuid`, {
    headers: { Authorization: 'Bearer legacy.guest' },
  })

  assert.equal(response.status, 401)
})

test('Supabase verifies access tokens before attempt route validation', async () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const originalFetch = globalThis.fetch
  process.env.SUPABASE_URL = 'https://auth.example.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

  globalThis.fetch = async (input, init) => {
    if (new URL(input).pathname === '/auth/v1/user') {
      return new Response(JSON.stringify({
        id: '970d834f-e2a1-4f48-95c3-51f429db8f65',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'learner@example.test',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return originalFetch(input, init)
  }

  try {
    const response = await originalFetch(`${baseUrl}/api/attempts/not-a-uuid`, {
      headers: { Authorization: 'Bearer header.payload.signature' },
    })
    assert.equal(response.status, 400)
  } finally {
    globalThis.fetch = originalFetch
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey
  }
})

test('database-backed routes fail explicitly when credentials are absent', async () => {
  const response = await fetch(`${baseUrl}/api/categories`)
  const body = await response.json()

  assert.equal(response.status, 503)
  assert.deepEqual(body, {
    success: false,
    message: 'Database service is not configured.',
    data: null,
  })
})

test('daily quiz route reports missing database configuration explicitly', async () => {
  const response = await fetch(`${baseUrl}/api/quizzes/daily`)
  const body = await response.json()

  assert.equal(response.status, 503)
  assert.deepEqual(body, {
    success: false,
    message: 'Database service is not configured.',
    data: null,
  })
})
