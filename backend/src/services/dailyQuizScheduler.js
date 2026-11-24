import cron from 'node-cron'
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

async function reportScheduleResult(reason) {
  try {
    const schedule = await ensureDailyQuizScheduled()
    if (schedule) {
      console.info(
        `Daily quiz scheduled for ${schedule.scheduled_date} (quiz ${schedule.quiz_id}); ${reason}.`,
      )
    } else {
      console.warn(`No eligible published five-question quiz is available; ${reason}.`)
    }
  } catch (error) {
    console.error(`Daily quiz scheduling failed during ${reason}:`, error)
  }
}

export function startDailyQuizScheduler() {
  const task = cron.schedule('0 0 * * *', () => {
    void reportScheduleResult('midnight schedule')
  }, { timezone: 'Asia/Jakarta' })

  void reportScheduleResult('startup recovery')
  return task
}
