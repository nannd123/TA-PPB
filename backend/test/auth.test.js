import assert from 'node:assert/strict'
import { test } from 'node:test'
import { register } from '../src/controllers/authController.js'

const user = {
  id: '970d834f-e2a1-4f48-95c3-51f429db8f65',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'learner@users.quizora.invalid',
  email_confirmed_at: '2026-01-01T00:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { username: 'learner', display_name: 'learner' },
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

test('registration creates a confirmed internal-email user and returns a session', async () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const originalFetch = globalThis.fetch
  const requests = []
  process.env.SUPABASE_URL = 'https://auth.example.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

  globalThis.fetch = async (input, init) => {
    const url = new URL(input)
    const body = JSON.parse(init.body)
    requests.push({ path: url.pathname, body })

    if (url.pathname.endsWith('/auth/v1/admin/users')) {
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.pathname.endsWith('/auth/v1/token')) {
      return new Response(JSON.stringify({
        access_token: 'header.payload.signature',
        refresh_token: 'refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: 1893456000,
        user,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Unexpected Supabase request: ${url.pathname}`)
  }

  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }

  try {
    await register({ body: { username: 'Learner', password: 'secret1' } }, response)

    assert.equal(response.statusCode, 201)
    assert.equal(response.body.data.session.access_token, 'header.payload.signature')
    assert.deepEqual(requests[0].body, {
      email: 'learner@users.quizora.invalid',
      password: 'secret1',
      email_confirm: true,
      user_metadata: { username: 'learner', display_name: 'learner' },
    })
    assert.equal(requests[1].body.email, 'learner@users.quizora.invalid')
  } finally {
    globalThis.fetch = originalFetch
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey
  }
})
