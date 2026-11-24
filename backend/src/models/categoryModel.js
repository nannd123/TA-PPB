import { getSupabaseClient } from '../config/supabaseClient.js'
import { unwrapDatabaseResult } from '../utils/database.js'

const CATEGORY_COLUMNS = 'id,name,slug,description,icon_name,created_at'
const QUIZ_COLUMNS = 'id,category_id,title,description,difficulty,duration_seconds,created_at,questions(count)'

function includeQuestionCount(quiz) {
  const { questions, ...fields } = quiz
  return { ...fields, question_count: questions?.[0]?.count ?? 0 }
}

export async function listCategories() {
  const result = await getSupabaseClient()
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .order('name', { ascending: true })

  return unwrapDatabaseResult(result)
}

export async function findCategoryById(id) {
  const result = await getSupabaseClient()
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  return unwrapDatabaseResult(result)
}

export async function listCategoryQuizzes(categoryId, { limit, offset }) {
  const result = await getSupabaseClient()
    .from('quizzes')
    .select(QUIZ_COLUMNS, { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('is_published', true)
    .order('title', { ascending: true })
    .range(offset, offset + limit - 1)

  const data = unwrapDatabaseResult(result)
  return {
    items: data.map(includeQuestionCount),
    count: result.count ?? data.length,
  }
}
