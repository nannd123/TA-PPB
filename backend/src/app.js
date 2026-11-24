import cors from 'cors'
import express from 'express'
import attemptRoutes from './routes/attemptRoutes.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import quizRoutes from './routes/quizRoutes.js'

const app = express()
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '64kb' }))
app.use('/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/attempts', attemptRoutes)

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  })
})

app.use((error, _request, response, _next) => {
  const candidateStatus = error.statusCode ?? error.status
  const status = Number.isInteger(candidateStatus) && candidateStatus >= 400 && candidateStatus <= 599
    ? candidateStatus
    : 500

  if (status >= 500 && error.cause) {
    console.error(error.cause)
  } else if (status === 500) {
    console.error(error)
  }

  response.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error.' : error.message,
    data: error.data ?? null,
  })
})

export default app
