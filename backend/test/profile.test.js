import assert from 'node:assert/strict'
import { test } from 'node:test'
import { updateProfile } from '../src/controllers/profileController.js'

const userId = '970d834f-e2a1-4f48-95c3-51f429db8f65'
const user = {
  id: userId,
  email: 'learner@users.quizora.invalid',
  user_metadata: { username: 'learner', display_name: 'Learner' },
}

function createResponse() {
  return {
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
}

test('profile update changes the internal sign-in email and username metadata', async () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const originalFetch = globalThis.fetch
  const updates = []
  process.env.SUPABASE_URL = 'https://auth.example.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

  globalThis.fetch = async (input, init) => {
    const url = new URL(input)
    if (url.pathname.endsWith(`/auth/v1/admin/users/${userId}`) && init.method === 'GET') {
      return new Response(JSON.stringify({ user }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.pathname.endsWith(`/auth/v1/admin/users/${userId}`) && init.method === 'PUT') {
      const body = JSON.parse(init.body)
      updates.push(body)
      return new Response(JSON.stringify({
        user: {
          ...user,
          email: body.email,
          user_metadata: body.user_metadata,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Unexpected Supabase request: ${url.pathname}`)
  }

  try {
    const response = createResponse()
    await updateProfile({
      userId,
      body: { display_name: 'New Name', username: 'new_learner' },
    }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(updates[0].email, 'new_learner@users.quizora.invalid')
    assert.equal(updates[0].email_confirm, true)
    assert.deepEqual(response.body.data.user.user_metadata, {
      username: 'new_learner',
      display_name: 'New Name',
    })
  } finally {
    globalThis.fetch = originalFetch
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey
  }
})
