import { Router } from 'express'
import { login, refreshSession, register } from '../controllers/authController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.post('/refresh', asyncHandler(refreshSession))

export default router
