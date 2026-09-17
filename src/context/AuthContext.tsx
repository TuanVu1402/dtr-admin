import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '../types/dtr'

export type UserProfile = {
  name: string
  email: string
  avatarUrl?: string
  password?: string
}

type ProfilesMap = Record<Role, UserProfile>

const STORAGE_KEY = 'dtr-admin-profiles-v1'

const defaultProfiles: ProfilesMap = {
  admin: { name: 'Đỗ Thanh Hằng', email: 'hang.do@dtr.vn', password: '123456' },
  manager: { name: 'Phạm Quốc Huy', email: 'huy.pham@dtr.vn', password: '123456' },
  support_admin: { name: 'Vũ Lan Anh', email: 'lananh.vu@dtr.vn', password: '123456' },
  gdda: { name: 'Nguyễn Minh Đức', email: 'duc.nguyen@dtr.vn', password: '123456' },
  dtlo: { name: 'Trần Thu Trang', email: 'trang.tran@dtr.vn', password: '123456' },
  user: { name: 'Người dùng', email: '', password: '123456' },
}

function loadProfiles(): ProfilesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProfiles
    return { ...defaultProfiles, ...(JSON.parse(raw) as Partial<ProfilesMap>) }
  } catch {
    return defaultProfiles
  }
}

function saveProfiles(profiles: ProfilesMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    // localStorage không khả dụng — chỉ giữ trong bộ nhớ tạm.
  }
}

type AuthContextValue = {
  role: Role | null
  /** Hồ sơ của người đang đăng nhập (theo vai trò hiện tại) — dùng cho header và trang Hồ sơ cá nhân. */
  profile: UserProfile
  login: (role: Role) => void
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [profiles, setProfiles] = useState<ProfilesMap>(loadProfiles)

  function updateProfile(updates: Partial<UserProfile>) {
    if (!role) return
    setProfiles((prev) => {
      const next = { ...prev, [role]: { ...prev[role], ...updates } }
      saveProfiles(next)
      return next
    })
  }

  const profile = role ? profiles[role] : defaultProfiles.user

  return (
    <AuthContext.Provider value={{ role, profile, login: setRole, logout: () => setRole(null), updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
