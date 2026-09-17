import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoles } from '../context/RolesContext'
import { canAccessPath, homePathForRole } from '../utils/roles'
import type { ReactNode } from 'react'

export default function RequireRole({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const { roleById } = useRoles()
  const location = useLocation()

  if (!role) return <Navigate to="/" replace />
  const roleDef = roleById(role)
  if (!canAccessPath(roleDef, location.pathname)) {
    return <Navigate to={homePathForRole(roleDef)} replace />
  }
  return children
}
