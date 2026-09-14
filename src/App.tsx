import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import AdminLayout from './pages/admin/AdminLayout'
import ManagerPanel from './pages/admin/ManagerPanel'
import AdminUsersPanel from './pages/admin/AdminUsersPanel'
import SupportAdminPanel from './pages/admin/SupportAdminPanel'
import FeedbackPanel from './pages/admin/FeedbackPanel'
import ReportsPanel from './pages/admin/ReportsPanel'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { TrainingSessionsProvider } from './context/TrainingSessionsContext'
import { FeedbackProvider } from './context/FeedbackContext'
import { SubmissionsProvider } from './context/SubmissionsContext'
import type { Role } from './types/dtr'

function AppShell() {
  const { role, login } = useAuth()
  const navigate = useNavigate()

  function handleAuthenticated(nextRole: Role) {
    login(nextRole)
    navigate('/')
  }

  if (!role) {
    return <AuthPage onAuthenticated={handleAuthenticated} />
  }

  return (
    <SubmissionsProvider>
      <TrainingSessionsProvider>
        <FeedbackProvider>
          <Routes>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="manager" replace />} />
              <Route path="manager" element={<ManagerPanel />} />
              <Route path="users" element={<AdminUsersPanel />} />
              <Route path="support" element={<SupportAdminPanel />} />
              <Route path="feedback" element={<FeedbackPanel />} />
              <Route path="reports" element={<ReportsPanel />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FeedbackProvider>
      </TrainingSessionsProvider>
    </SubmissionsProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
