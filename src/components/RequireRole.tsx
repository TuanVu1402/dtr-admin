import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAccessPath, homePathForRole } from '../utils/roles'
import type { ReactNode } from 'react'

export default function RequireRole({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const location = useLocation()

  if (!role) return <Navigate to="/" replace />
  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to={homePathForRole(role)} replace />
  }
  return children
}
