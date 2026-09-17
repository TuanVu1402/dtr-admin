import {
  allPermissionKeys,
  moduleRegistry,
  type ModuleKey,
  type PermissionKey,
  type RoleDefinition,
} from '../types/permission'

/** Id hạng mục clip chuyên trách — dùng làm phạm vi mặc định cho GĐDA / ĐTLO. */
export const GDDA_CATEGORY_ID = 'clip-dtlo-regular'
export const DTLO_CATEGORY_ID = 'clip-dtlo'

function permsOf(module: ModuleKey, ...actions: string[]): PermissionKey[] {
  return actions.map((a) => `${module}.${a}` as PermissionKey)
}

const everyModule = moduleRegistry.map((m) => m.key)

/** Vai trò có sẵn khi chưa ai chỉnh gì. Super Admin dùng cờ isSuper nên không cần liệt kê quyền. */
export const defaultRoles: RoleDefinition[] = [
  {
    id: 'support_admin',
    name: 'Super Admin',
    description: 'Quyền cao nhất — toàn bộ chức năng, duyệt mọi hạng mục, quản lý vai trò.',
    system: true,
    isSuper: true,
    enabledModules: everyModule,
    permissions: allPermissionKeys(),
    scopes: {},
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Vận hành hệ thống. Không quản lý vai trò, không duyệt 2 hạng mục clip chuyên trách.',
    system: true,
    enabledModules: ['evidence', 'users', 'qr', 'categories', 'feedback', 'reports', 'audit'],
    permissions: [
      ...permsOf('evidence', 'view', 'approve', 'reject', 'create', 'import'),
      ...permsOf('users', 'view', 'create', 'edit', 'delete', 'lock', 'resetPassword', 'assignRoom', 'import', 'export'),
      ...permsOf('qr', 'view', 'create', 'toggle', 'checkin', 'delete', 'export'),
      ...permsOf('categories', 'view', 'edit', 'toggle', 'reset'),
      ...permsOf('feedback', 'view', 'reply', 'toggle', 'assign'),
      ...permsOf('reports', 'view', 'export', 'exportPdf'),
      ...permsOf('audit', 'view', 'export'),
    ],
    // Admin duyệt mọi hạng mục TRỪ 2 clip chuyên trách — biểu diễn bằng phạm vi loại trừ
    // qua danh sách hạng mục còn lại, sẽ được điền đầy đủ lúc khởi tạo (xem rolesFromCategories).
    scopes: {},
  },
  {
    id: 'gdda',
    name: 'GĐDA',
    description: 'Chỉ duyệt hạng mục clip do GĐDA phụ trách.',
    system: true,
    enabledModules: ['evidence', 'users', 'reports'],
    permissions: [
      ...permsOf('evidence', 'view', 'approve', 'reject'),
      ...permsOf('users', 'view'),
      ...permsOf('reports', 'view'),
    ],
    scopes: { category: [GDDA_CATEGORY_ID] },
  },
  {
    id: 'dtlo',
    name: 'ĐTLO',
    description: 'Chỉ duyệt hạng mục clip do ĐTLO phụ trách.',
    system: true,
    enabledModules: ['evidence', 'users', 'reports'],
    permissions: [
      ...permsOf('evidence', 'view', 'approve', 'reject'),
      ...permsOf('users', 'view'),
      ...permsOf('reports', 'view'),
    ],
    scopes: { category: [DTLO_CATEGORY_ID] },
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Chỉ xem thông tin người dùng.',
    system: true,
    enabledModules: ['users'],
    permissions: [...permsOf('users', 'view')],
    scopes: {},
  },
  {
    id: 'user',
    name: 'Người dùng',
    description: 'Sales nộp minh chứng trên app User, không vào được trang Admin.',
    system: true,
    enabledModules: [],
    permissions: [],
    scopes: {},
  },
]

/**
 * Admin được duyệt "6 hạng mục khác" — tức mọi hạng mục trừ 2 clip chuyên trách.
 * Phải tính theo danh sách hạng mục thật nên điền ở đây thay vì hằng số cứng.
 */
export function withSeededScopes(roles: RoleDefinition[], categoryIds: string[]): RoleDefinition[] {
  return roles.map((role) => {
    if (role.id !== 'admin' || role.scopes.category !== undefined) return role
    const others = categoryIds.filter((id) => id !== GDDA_CATEGORY_ID && id !== DTLO_CATEGORY_ID)
    return { ...role, scopes: { ...role.scopes, category: others } }
  })
}
