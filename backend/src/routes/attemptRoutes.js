import { Router } from 'express'
import {
  getAttemptHistory,
  getAttemptResult,
  submitQuizAttempt,
} from '../controllers/attemptController.js'
import { requireAuthenticatedUser } from '../middleware/requireAuthenticatedUser.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(requireAuthenticatedUser)
router.get('/', asyncHandler(getAttemptHistory))
router.post('/:id/submit', asyncHandler(submitQuizAttempt))
router.get('/:id', asyncHandler(getAttemptResult))

export default router
