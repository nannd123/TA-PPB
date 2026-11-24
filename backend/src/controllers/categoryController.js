import {
  findCategoryById,
  listCategories,
  listCategoryQuizzes,
} from '../models/categoryModel.js'
import { AppError } from '../utils/appError.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { parsePagination, requireUuid } from '../utils/validation.js'

export async function getCategories(_request, response) {
  const categories = await listCategories()
  return sendSuccess(response, 'Categories retrieved.', categories)
}

export async function getCategory(request, response) {
  const categoryId = requireUuid(request.params.id, 'category id')
  const category = await findCategoryById(categoryId)

  if (!category) {
    throw new AppError(404, 'Category not found.')
  }

  return sendSuccess(response, 'Category retrieved.', category)
}

export async function getCategoryQuizzes(request, response) {
  const categoryId = requireUuid(request.params.id, 'category id')
  const pagination = parsePagination(request.query)
  const category = await findCategoryById(categoryId)

  if (!category) {
    throw new AppError(404, 'Category not found.')
  }

  const result = await listCategoryQuizzes(categoryId, pagination)
  return sendSuccess(response, 'Category quizzes retrieved.', {
    category,
    quizzes: result.items,
  }, 200, { ...pagination, total: result.count })
}
