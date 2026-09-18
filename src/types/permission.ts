/**
 * Mô hình phân quyền 4 tầng:
 *
 *   NGƯỜI DÙNG  →  VAI TRÒ (Role)  →  QUYỀN (Permission)  →  PHẠM VI DỮ LIỆU (Data Scope)
 *
 * - Người dùng giữ một roleId (AdminUser.role).
 * - Vai trò là DỮ LIỆU (RoleDefinition), tạo / sửa / xóa được từ trang Phân quyền.
 * - Quyền = "module.action", bật tắt bằng checkbox trong modal Phân quyền chức năng.
 * - Phạm vi dữ liệu giới hạn quyền đó áp lên những bản ghi nào (hạng mục nào, phòng nào).
 */

export type ModuleKey = 'evidence' | 'users' | 'qr' | 'categories' | 'feedback' | 'reports' | 'audit' | 'roles'

export type ActionKey =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'toggle'
  | 'import'
  | 'export'
  | 'exportPdf'
  | 'reset'
  | 'lock'
  | 'resetPassword'
  | 'assignRoom'
  | 'checkin'
  | 'reply'
  | 'assign'
  | 'manage'

export type PermissionKey = `${ModuleKey}.${ActionKey}`

/** Các trục phạm vi dữ liệu. Thêm trục mới chỉ cần thêm vào đây + khai báo ở moduleRegistry. */
export type ScopeAxis = 'category' | 'room'

/**
 * Giá trị phạm vi: mảng id cụ thể, hoặc null/thiếu = "Tất cả".
 * Lưu null thay vì liệt kê hết để payload gọn (sharedStore chỉ đồng bộ qua cookie khi < 3.5KB).
 */
export type ScopeSelection = string[] | null

export type RoleScopes = Partial<Record<ScopeAxis, ScopeSelection>>

export type RoleDefinition = {
  id: string
  name: string
  description?: string
  /** Vai trò hệ thống: không cho xóa, không cho đổi mã. */
  system?: boolean
  /** Quyền cao nhất — bỏ qua mọi kiểm tra quyền và phạm vi. */
  isSuper?: boolean
  /** Module đang bật (công tắc đỏ ở đầu mỗi thẻ trong modal). */
  enabledModules: ModuleKey[]
  /** Các ô checkbox đang tick. */
  permissions: PermissionKey[]
  scopes: RoleScopes
}

export type ActionDef = {
  key: ActionKey
  label: string
}

export type ModuleDef = {
  key: ModuleKey
  label: string
  /** Đường dẫn trang tương ứng — dùng cho menu và chặn route. */
  path?: string
  /** Quyền tối thiểu để vào trang của module. */
  actions: ActionDef[]
  /** Trục phạm vi module này hỗ trợ; rỗng nghĩa là quyền áp cho mọi bản ghi. */
  scopeAxes: ScopeAxis[]
}

export const scopeAxisLabels: Record<ScopeAxis, string> = {
  category: 'Hạng mục áp dụng',
  room: 'Phòng áp dụng',
}

/**
 * NGUỒN SỰ THẬT DUY NHẤT của tầng Quyền.
 * Modal Phân quyền chức năng render trực tiếp từ đây, và mọi chỗ kiểm tra quyền đều
 * dùng key sinh ra từ đây — thêm module/hành động mới chỉ sửa đúng file này.
 */
export const moduleRegistry: ModuleDef[] = [
  {
    key: 'evidence',
    label: 'Quản lý chấm điểm minh chứng',
    path: 'manager',
    scopeAxes: ['category', 'room'],
    actions: [
      { key: 'view', label: 'Xem minh chứng' },
      { key: 'approve', label: 'Phê duyệt' },
      { key: 'reject', label: 'Từ chối' },
      { key: 'create', label: 'Thêm thủ công' },
      { key: 'import', label: 'Nhập từ Excel' },
    ],
  },
  {
    key: 'users',
    label: 'Quản lý người dùng',
    path: 'admin',
    scopeAxes: ['room'],
    actions: [
      { key: 'view', label: 'Xem danh sách' },
      { key: 'create', label: 'Thêm' },
      { key: 'edit', label: 'Chỉnh sửa' },
      { key: 'delete', label: 'Xóa' },
      { key: 'lock', label: 'Khóa / Mở khóa' },
      { key: 'resetPassword', label: 'Reset mật khẩu' },
      { key: 'assignRoom', label: 'Gán phòng' },
      { key: 'import', label: 'Nhập từ Excel' },
      { key: 'export', label: 'Xuất dữ liệu' },
    ],
  },
  {
    key: 'qr',
    label: 'Quản lý mã QR điểm danh',
    scopeAxes: [],
    actions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Tạo mã QR' },
      { key: 'toggle', label: 'Đóng / Mở lại' },
      { key: 'checkin', label: 'Điểm danh hộ' },
      { key: 'delete', label: 'Xóa buổi' },
      { key: 'export', label: 'Xuất dữ liệu' },
    ],
  },
  {
    key: 'categories',
    label: 'Quản lý hạng mục điểm',
    path: 'categories',
    scopeAxes: ['category'],
    actions: [
      { key: 'view', label: 'Xem' },
      { key: 'create', label: 'Thêm hạng mục' },
      { key: 'edit', label: 'Sửa cấu hình điểm' },
      { key: 'toggle', label: 'Bật / Tắt hạng mục' },
      { key: 'delete', label: 'Xóa hạng mục' },
      { key: 'reset', label: 'Khôi phục mặc định' },
    ],
  },
  {
    key: 'feedback',
    label: 'Quản lý góp ý, phản ánh',
    path: 'feedback',
    scopeAxes: [],
    actions: [
      { key: 'view', label: 'Xem' },
      { key: 'reply', label: 'Trả lời' },
      { key: 'toggle', label: 'Đổi trạng thái' },
      { key: 'assign', label: 'Gán người xử lý' },
    ],
  },
  {
    key: 'reports',
    label: 'Báo cáo & thống kê',
    path: 'reports',
    scopeAxes: ['category', 'room'],
    actions: [
      { key: 'view', label: 'Xem điểm toàn bộ' },
      { key: 'export', label: 'Xuất Excel' },
      { key: 'exportPdf', label: 'Xuất PDF' },
    ],
  },
  {
    key: 'audit',
    label: 'Nhật ký thao tác',
    path: 'audit',
    scopeAxes: [],
    actions: [
      { key: 'view', label: 'Xem lịch sử' },
      { key: 'export', label: 'Xuất dữ liệu' },
    ],
  },
  {
    key: 'roles',
    label: 'Phân quyền & vai trò',
    path: 'roles',
    scopeAxes: [],
    actions: [
      { key: 'view', label: 'Xem phân quyền' },
      { key: 'manage', label: 'Tạo / sửa vai trò' },
      { key: 'assign', label: 'Gán vai trò cho người dùng' },
    ],
  },
]

export const moduleByKey = new Map(moduleRegistry.map((m) => [m.key, m]))

export function permissionKey(module: ModuleKey, action: ActionKey): PermissionKey {
  return `${module}.${action}`
}

export function permissionLabel(key: PermissionKey): string {
  const [moduleKey, actionKey] = key.split('.') as [ModuleKey, ActionKey]
  const module = moduleByKey.get(moduleKey)
  const action = module?.actions.find((a) => a.key === actionKey)
  if (!module || !action) return key
  return `${module.label} — ${action.label}`
}

/** Mọi quyền có thật trong hệ thống. */
export function allPermissionKeys(): PermissionKey[] {
  return moduleRegistry.flatMap((m) => m.actions.map((a) => permissionKey(m.key, a.key)))
}
