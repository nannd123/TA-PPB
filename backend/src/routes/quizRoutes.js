import { Router } from 'express'
import {
  getDailyQuiz,
  getQuiz,
  getQuizQuestions,
  getQuizzes,
  startQuizAttempt,
} from '../controllers/quizController.js'
import { requireAuthenticatedUser } from '../middleware/requireAuthenticatedUser.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(getQuizzes))
router.get('/daily', asyncHandler(getDailyQuiz))
router.get('/:id/questions', asyncHandler(getQuizQuestions))
router.post('/:id/attempts', requireAuthenticatedUser, asyncHandler(startQuizAttempt))
router.get('/:id', asyncHandler(getQuiz))

export default router
