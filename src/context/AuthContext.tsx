import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '../types/dtr'

type AuthContextValue = {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)

  return (
    <AuthContext.Provider value={{ role, login: setRole, logout: () => setRole(null) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
