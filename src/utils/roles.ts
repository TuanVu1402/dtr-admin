import type { Role } from '../types/dtr'

export const DEFAULT_DEMO_PASSWORD = '123456'

export type AppTab = {
  to: string
  label: string
  roles: Role[]
}

export const appTabs: AppTab[] = [
  { to: 'manager', label: 'Chấm điểm', roles: ['manager', 'support_admin'] },
  { to: 'admin', label: 'Người dùng', roles: ['admin', 'support_admin'] },
  { to: 'categories', label: 'Hạng mục', roles: ['admin', 'support_admin'] },
  { to: 'feedback', label: 'Phản hồi', roles: ['admin', 'support_admin'] },
  { to: 'reports', label: 'Thống kê', roles: ['manager', 'admin', 'support_admin'] },
  { to: 'audit', label: 'Nhật ký', roles: ['admin', 'support_admin'] },
]

const extraPaths: Record<string, Role[]> = {
  settings: ['manager', 'admin', 'support_admin'],
  profile: ['manager', 'admin', 'support_admin'],
}

export function homePathForRole(role: Role): string {
  if (role === 'manager') return '/manager'
  return '/admin'
}

export function rolesForPath(path: string): Role[] | null {
  const slug = path.replace(/^\//, '').split('/')[0] || ''
  const tab = appTabs.find((t) => t.to === slug)
  if (tab) return tab.roles
  if (extraPaths[slug]) return extraPaths[slug]
  return null
}

export function canAccessPath(role: Role, path: string): boolean {
  const allowed = rolesForPath(path)
  if (!allowed) return true
  return allowed.includes(role)
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === 'support_admin') return ['user', 'manager', 'admin', 'support_admin']
  if (actor === 'admin') return ['user', 'manager']
  return []
}

export function generateTempPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}
