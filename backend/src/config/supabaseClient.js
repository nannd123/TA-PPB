import { createClient } from '@supabase/supabase-js'
import { AppError } from '../utils/appError.js'

let client

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new AppError(503, 'Database service is not configured.')
  }

  if (!client) {
    try {
      client = createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      })
    } catch (error) {
      throw new AppError(503, 'Database service configuration is invalid.', { cause: error })
    }
  }

  return client
}

export function createAuthClient() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new AppError(503, 'Authentication service is not configured.')
  }

  try {
    return createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  } catch (error) {
    throw new AppError(503, 'Authentication service configuration is invalid.', { cause: error })
  }
}
