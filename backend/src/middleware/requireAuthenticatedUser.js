import { getSupabaseClient } from '../config/supabaseClient.js'
import { AppError } from '../utils/appError.js'

export async function requireAuthenticatedUser(request, _response, next) {
  const authorization = request.get('authorization') ?? ''
  const match = /^Bearer\s+(\S+)$/i.exec(authorization)

  if (!match || match[1].split('.').length !== 3) {
    return next(new AppError(401, 'A valid user access token is required.'))
  }

  try {
    const { data, error } = await getSupabaseClient().auth.getUser(match[1])
    if (error || !data.user) {
      return next(new AppError(401, 'A valid user access token is required.'))
    }

    request.userId = data.user.id
    return next()
  } catch (error) {
    return next(error)
  }
}
