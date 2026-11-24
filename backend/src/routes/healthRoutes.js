import { Router } from 'express'

const router = Router()

router.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'API is healthy',
    data: {
      service: 'quizora-api',
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
