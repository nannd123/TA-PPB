import { getSupabaseClient } from '../config/supabaseClient.js'
import { unwrapDatabaseResult } from '../utils/database.js'
import { getJakartaDate } from '../utils/jakartaDate.js'

export async function ensureDailyQuizScheduled(
  scheduledDate = getJakartaDate(),
  client = getSupabaseClient(),
) {
  const result = await client.rpc('ensure_daily_quiz_scheduled', {
    p_scheduled_date: scheduledDate,
  })
  const schedules = unwrapDatabaseResult(result, 'Daily quiz scheduling failed.')

  if (!Array.isArray(schedules)) {
    throw new TypeError('Daily quiz scheduling returned an invalid database response.')
  }

  return schedules[0] ?? null
}
