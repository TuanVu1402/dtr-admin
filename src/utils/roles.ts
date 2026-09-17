import type { Role } from '../types/dtr'

export const DEFAULT_DEMO_PASSWORD = '123456'

export type AppTab = {
  to: string
  label: string
  roles: Role[]
}

/** Nhãn hạng mục clip mà mỗi vai trò duyệt viên được phép duyệt — phải khớp title trong dtrData.ts. */
export const clipApprovalCategoryLabel: Partial<Record<Role, string>> = {
  gdda: 'Sản xuất 1 clip chất lượng cho (GĐDA duyệt)',
  dtlo: 'Sản xuất 1 clip chất lượng cho (ĐTLO duyệt)',
}

export const appTabs: AppTab[] = [
  { to: 'manager', label: 'Chấm điểm', roles: ['gdda', 'dtlo', 'support_admin'] },
  { to: 'admin', label: 'Người dùng', roles: ['admin', 'support_admin', 'manager'] },
  { to: 'categories', label: 'Hạng mục', roles: ['admin', 'support_admin'] },
  { to: 'feedback', label: 'Phản hồi', roles: ['admin', 'support_admin'] },
  { to: 'reports', label: 'Thống kê', roles: ['admin', 'support_admin'] },
  { to: 'audit', label: 'Nhật ký', roles: ['admin', 'support_admin'] },
]

const extraPaths: Record<string, Role[]> = {
  settings: ['manager', 'admin', 'gdda', 'dtlo', 'support_admin'],
  profile: ['manager', 'admin', 'gdda', 'dtlo', 'support_admin'],
}

export function homePathForRole(role: Role): string {
  if (role === 'gdda' || role === 'dtlo') return '/manager'
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
  if (actor === 'support_admin') return ['user', 'manager', 'gdda', 'dtlo', 'admin', 'support_admin']
  if (actor === 'admin') return ['user', 'manager', 'gdda', 'dtlo']
  return []
}

export function generateTempPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}
