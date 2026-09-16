import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import AdminLayout from './pages/admin/AdminLayout'
import ManagerPanel from './pages/admin/ManagerPanel'
import AdminUsersPanel from './pages/admin/AdminUsersPanel'
import FeedbackPanel from './pages/admin/FeedbackPanel'
import ReportsPanel from './pages/admin/ReportsPanel'
import SettingsPanel from './pages/admin/SettingsPanel'
import ProfilePanel from './pages/admin/ProfilePanel'
import CategoriesPanel from './pages/admin/CategoriesPanel'
import AuditPanel from './pages/admin/AuditPanel'
import RequireRole from './components/RequireRole'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { TrainingSessionsProvider } from './context/TrainingSessionsContext'
import { FeedbackProvider } from './context/FeedbackContext'
import { SubmissionsProvider } from './context/SubmissionsContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { AuditProvider } from './context/AuditContext'
import { homePathForRole } from './utils/roles'
import type { Role } from './types/dtr'

function AppShell() {
  const { role, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!role && location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }, [role, location.pathname, navigate])

  function handleAuthenticated(nextRole: Role) {
    login(nextRole)
    navigate(homePathForRole(nextRole))
  }

  if (!role) {
    return <AuthPage onAuthenticated={handleAuthenticated} />
  }

  return (
    <SubmissionsProvider>
      <TrainingSessionsProvider>
        <FeedbackProvider>
          <CategoriesProvider>
            <NotificationsProvider>
              <AuditProvider>
                <Routes>
                  <Route path="/" element={<AdminLayout />}>
                    <Route index element={<Navigate to={homePathForRole(role).slice(1)} replace />} />
                    <Route
                      path="manager"
                      element={
                        <RequireRole>
                          <ManagerPanel />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="admin"
                      element={
                        <RequireRole>
                          <AdminUsersPanel />
                        </RequireRole>
                      }
                    />
                    <Route path="users" element={<Navigate to="/admin" replace />} />
                    <Route
                      path="categories"
                      element={
                        <RequireRole>
                          <CategoriesPanel />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="feedback"
                      element={
                        <RequireRole>
                          <FeedbackPanel />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="reports"
                      element={
                        <RequireRole>
                          <ReportsPanel />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="audit"
                      element={
                        <RequireRole>
                          <AuditPanel />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <RequireRole>
                          <SettingsPanel />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <RequireRole>
                          <ProfilePanel />
                        </RequireRole>
                      }
                    />
                    <Route path="support" element={<Navigate to={homePathForRole(role)} replace />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AuditProvider>
            </NotificationsProvider>
          </CategoriesProvider>
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
