import express, { Router } from 'express'
import { updateProfile, uploadAvatar } from '../controllers/profileController.js'
import { requireAuthenticatedUser } from '../middleware/requireAuthenticatedUser.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(requireAuthenticatedUser)
router.patch('/', asyncHandler(updateProfile))
router.post(
  '/avatar',
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }),
  asyncHandler(uploadAvatar),
)

export default router
