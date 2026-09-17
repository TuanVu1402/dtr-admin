import { moduleRegistry, type ModuleKey, type RoleDefinition } from '../types/permission'
import { roleCanUseModule } from './permissions'

export const DEFAULT_DEMO_PASSWORD = '123456'

export type AppTab = {
  to: string
  label: string
  moduleKey: ModuleKey
}

/** Nhãn hiển thị trên menu — ngắn hơn tên module trong modal phân quyền. */
const tabLabels: Partial<Record<ModuleKey, string>> = {
  evidence: 'Chấm điểm',
  users: 'Người dùng',
  categories: 'Hạng mục',
  feedback: 'Phản hồi',
  reports: 'Báo cáo',
  audit: 'Nhật ký',
  roles: 'Phân quyền',
}

/** Menu sinh thẳng từ registry — thêm module mới là tự có tab, không sửa chỗ nào khác. */
export const appTabs: AppTab[] = moduleRegistry
  .filter((m) => Boolean(m.path))
  .map((m) => ({ to: m.path as string, label: tabLabels[m.key] ?? m.label, moduleKey: m.key }))

/** Trang cá nhân ai đăng nhập cũng vào được — không gắn với quyền nghiệp vụ nào. */
const selfServicePaths = ['settings', 'profile']

export function tabsForRole(role: RoleDefinition | undefined): AppTab[] {
  return appTabs.filter((tab) => roleCanUseModule(role, tab.moduleKey))
}

export function homePathForRole(role: RoleDefinition | undefined): string {
  const first = tabsForRole(role)[0]
  return first ? `/${first.to}` : '/profile'
}

export function canAccessPath(role: RoleDefinition | undefined, path: string): boolean {
  const slug = path.replace(/^\//, '').split('/')[0] || ''
  if (selfServicePaths.includes(slug)) return true
  const tab = appTabs.find((t) => t.to === slug)
  // Không tìm thấy tab tương ứng thì chặn — an toàn hơn là mở.
  if (!tab) return false
  return roleCanUseModule(role, tab.moduleKey)
}

export function generateTempPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}
