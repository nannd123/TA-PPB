import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/RequireAuth.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import AboutPage from './pages/AboutPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CategoriesPage from './pages/CategoriesPage.jsx'
import CategoryDetailPage from './pages/CategoryDetailPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import QuizDetailPage from './pages/QuizDetailPage.jsx'
import QuizResultPage from './pages/QuizResultPage.jsx'
import QuizSessionPage from './pages/QuizSessionPage.jsx'
import QuizHistoryPage from './pages/QuizHistoryPage.jsx'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="auth" element={<AuthPage />} />
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<HomePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:categoryId" element={<CategoryDetailPage />} />
            <Route path="quizzes/:quizId" element={<QuizDetailPage />} />
            <Route path="quiz/:quizId/session" element={<QuizSessionPage />} />
            <Route path="attempts/:attemptId" element={<QuizResultPage />} />
            <Route path="history" element={<QuizHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="not-found" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
