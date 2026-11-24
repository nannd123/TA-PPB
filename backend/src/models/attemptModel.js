import { getSupabaseClient } from '../config/supabaseClient.js'
import { mapSubmitError, unwrapDatabaseResult } from '../utils/database.js'

async function findActiveAttempt(quizId, userId) {
  const result = await getSupabaseClient()
    .from('quiz_attempts')
    .select('id,quiz_id,status,started_at')
    .eq('quiz_id', quizId)
    .eq('guest_id', userId)
    .eq('status', 'in_progress')
    .maybeSingle()

  return unwrapDatabaseResult(result)
}

export async function createOrResumeAttempt(quizId, userId) {
  const existingAttempt = await findActiveAttempt(quizId, userId)
  if (existingAttempt) {
    return { attempt: existingAttempt, resumed: true }
  }

  const result = await getSupabaseClient()
    .from('quiz_attempts')
    .insert({ quiz_id: quizId, guest_id: userId })
    .select('id,quiz_id,status,started_at')
    .single()

  if (result.error?.code === '23505') {
    const activeAttempt = await findActiveAttempt(quizId, userId)
    if (activeAttempt) {
      return { attempt: activeAttempt, resumed: true }
    }
  }

  return { attempt: unwrapDatabaseResult(result), resumed: false }
}

export async function submitAttempt(attemptId, userId, answers) {
  const { data, error } = await getSupabaseClient().rpc('submit_quiz_attempt', {
    p_attempt_id: attemptId,
    p_guest_id: userId,
    p_answers: answers,
  })

  if (error) {
    mapSubmitError(error)
  }

  return data
}

export async function listAttempts(userId, { limit, offset }) {
  const result = await getSupabaseClient()
    .from('quiz_attempts')
    .select('id,quiz_id,status,started_at,submitted_at,score,correct_count,total_questions,duration_seconds,quiz:quizzes(id,title,category:categories(id,name))', { count: 'exact' })
    .eq('guest_id', userId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const data = unwrapDatabaseResult(result)
  return {
    items: data,
    count: result.count ?? data.length,
  }
}

export async function findSubmittedAttempt(attemptId, userId) {
  const result = await getSupabaseClient()
    .from('quiz_attempts')
    .select('id,quiz_id,status,started_at,submitted_at,score,correct_count,total_questions,duration_seconds,quiz:quizzes(id,title,category:categories(id,name)),answers:quiz_attempt_answers(question_id,selected_option_id,is_correct,question:questions!quiz_attempt_answers_quiz_question_fk(id,question_text,explanation,points,order_number,options:answer_options(id,option_label,option_text,is_correct)))')
    .eq('id', attemptId)
    .eq('guest_id', userId)
    .eq('status', 'submitted')
    .maybeSingle()

  return unwrapDatabaseResult(result)
}
