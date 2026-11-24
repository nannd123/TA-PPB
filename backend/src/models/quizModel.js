import { getSupabaseClient } from '../config/supabaseClient.js'
import { unwrapDatabaseResult } from '../utils/database.js'

const QUIZ_COLUMNS = 'id,category_id,title,description,difficulty,duration_seconds,created_at,category:categories(id,name,slug,icon_name),questions(count)'
const DAILY_QUIZ_COLUMNS = 'id,category_id,title,description,difficulty,duration_seconds,created_at,category:categories(id,name,slug,icon_name),questions(count)'

function includeQuestionCount(quiz) {
  const { questions, ...fields } = quiz
  return { ...fields, question_count: questions?.[0]?.count ?? 0 }
}

export async function listQuizzes({ categoryId, difficulty, limit, offset }) {
  let query = getSupabaseClient()
    .from('quizzes')
    .select(QUIZ_COLUMNS, { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  const result = await query
  const data = unwrapDatabaseResult(result)
  return {
    items: data.map(includeQuestionCount),
    count: result.count ?? data.length,
  }
}

export async function findDailyQuiz(scheduledDate) {
  const result = await getSupabaseClient()
    .from('daily_quiz_schedule')
    .select(`scheduled_date,quiz:quizzes!inner(${DAILY_QUIZ_COLUMNS})`)
    .eq('scheduled_date', scheduledDate)
    .eq('quiz.is_published', true)
    .maybeSingle()

  const data = unwrapDatabaseResult(result)
  if (!data?.quiz) {
    return null
  }

  const quiz = includeQuestionCount(data.quiz)
  return quiz.question_count === 5
    ? { ...quiz, scheduled_date: data.scheduled_date }
    : null
}

export async function findPublishedQuizById(id) {
  const result = await getSupabaseClient()
    .from('quizzes')
    .select(QUIZ_COLUMNS)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  const data = unwrapDatabaseResult(result)
  return data ? includeQuestionCount(data) : null
}

export async function findPublishedQuizForAttempt(id) {
  const result = await getSupabaseClient()
    .from('quizzes')
    .select('id,duration_seconds,questions(count)')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()

  return unwrapDatabaseResult(result)
}

export async function listQuizQuestions(quizId) {
  const result = await getSupabaseClient()
    .from('questions')
    .select('id,quiz_id,question_text,points,order_number,answer_options(id,option_label,option_text)')
    .eq('quiz_id', quizId)
    .order('order_number', { ascending: true })

  return unwrapDatabaseResult(result)
}
