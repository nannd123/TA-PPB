import { getSupabaseClient } from '../config/supabaseClient.js'
import { AppError } from '../utils/appError.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { parseProfileUpdates } from '../utils/validation.js'

const avatarTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

async function updateUserMetadata(userId, metadata) {
  const client = getSupabaseClient()
  const { data, error: getUserError } = await client.auth.admin.getUserById(userId)
  if (getUserError || !data.user) {
    throw new AppError(502, 'User profile could not be retrieved.', { cause: getUserError })
  }

  const { username, ...userMetadata } = metadata
  const update = {
    user_metadata: { ...data.user.user_metadata, ...userMetadata },
  }

  if (username && username !== data.user.user_metadata?.username) {
    update.email = `${username}@users.quizora.invalid`
    update.email_confirm = true
    update.user_metadata.username = username
  }

  const { data: updated, error: updateError } = await client.auth.admin.updateUserById(userId, update)
  if (updateError?.code === 'email_exists' || updateError?.code === 'user_already_exists') {
    throw new AppError(409, 'Username sudah digunakan.', { cause: updateError })
  }

  if (updateError || !updated.user) {
    throw new AppError(502, 'User profile could not be updated.', { cause: updateError })
  }

  return updated.user
}

export async function updateProfile(request, response) {
  const { displayName, username } = parseProfileUpdates(request.body)
  const user = await updateUserMetadata(request.userId, {
    display_name: displayName,
    ...(username ? { username } : {}),
  })

  return sendSuccess(response, 'Profile updated.', { user })
}

export async function uploadAvatar(request, response) {
  const contentType = request.get('content-type')?.split(';')[0].trim().toLowerCase()
  const extension = avatarTypes.get(contentType)
  if (!extension || !Buffer.isBuffer(request.body) || request.body.length === 0) {
    throw new AppError(400, 'Choose a JPG, PNG, or WebP image.')
  }

  const path = `${request.userId}/profile.${extension}`
  const client = getSupabaseClient()
  const { error: uploadError } = await client.storage
    .from('quizora-avatars')
    .upload(path, request.body, { upsert: true, contentType })

  if (uploadError) {
    throw new AppError(502, 'Profile image could not be uploaded.', { cause: uploadError })
  }

  const avatarUrl = `${client.storage.from('quizora-avatars').getPublicUrl(path).data.publicUrl}?updated=${Date.now()}`
  const user = await updateUserMetadata(request.userId, { avatar_url: avatarUrl })

  return sendSuccess(response, 'Profile image uploaded.', { user, avatar_url: avatarUrl })
}
