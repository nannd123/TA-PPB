import { createAuthClient, getSupabaseClient } from '../config/supabaseClient.js'
import { AppError } from '../utils/appError.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { parseAuthCredentials } from '../utils/validation.js'

function usernameEmail(username) {
  return `${username}@users.quizora.invalid`
}

function authFailure(error, message) {
  if (error?.code === 'email_exists' || error?.code === 'user_already_exists') {
    return new AppError(409, 'Username sudah digunakan.')
  }

  return new AppError(502, message, { cause: error })
}

export async function register(request, response) {
  const { username, password } = parseAuthCredentials(request.body)
  const client = getSupabaseClient()
  const { data: created, error: createError } = await client.auth.admin.createUser({
    email: usernameEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username, display_name: username },
  })

  if (createError) {
    throw authFailure(createError, 'Account registration could not be completed.')
  }

  const { data, error: signInError } = await createAuthClient().auth.signInWithPassword({
    email: usernameEmail(username),
    password,
  })

  if (signInError || !data.session) {
    throw new AppError(502, 'Account was created, but a login session could not be started.', {
      cause: signInError,
    })
  }

  return sendSuccess(response, 'Account registered.', {
    session: data.session,
    user: data.user ?? created.user,
  }, 201)
}

export async function login(request, response) {
  const { username, password } = parseAuthCredentials(request.body)
  const { data, error } = await createAuthClient().auth.signInWithPassword({
    email: usernameEmail(username),
    password,
  })

  if (error || !data.session || !data.user) {
    if (error && (error.status >= 500 || error.code === 'unexpected_failure')) {
      throw new AppError(502, 'Authentication service could not complete login.', { cause: error })
    }

    throw new AppError(401, 'Username atau kata sandi salah.')
  }

  return sendSuccess(response, 'Signed in.', {
    session: data.session,
    user: data.user,
  })
}

export async function refreshSession(request, response) {
  const refreshToken = request.body?.refresh_token
  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    throw new AppError(400, 'A refresh token is required.')
  }

  const { data, error } = await createAuthClient().auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (error || !data.session || !data.user) {
    throw new AppError(401, 'Sesi login tidak valid. Silakan masuk kembali.')
  }

  return sendSuccess(response, 'Session refreshed.', {
    session: data.session,
    user: data.user,
  })
}
