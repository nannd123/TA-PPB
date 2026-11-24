import { Router } from 'express'
import {
  getCategories,
  getCategory,
  getCategoryQuizzes,
} from '../controllers/categoryController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(getCategories))
router.get('/:id/quizzes', asyncHandler(getCategoryQuizzes))
router.get('/:id', asyncHandler(getCategory))

export default router
