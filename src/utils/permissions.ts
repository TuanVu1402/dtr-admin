import type { Category } from '../types/dtr'
import type { ActionKey, ModuleKey, PermissionKey, RoleDefinition, ScopeAxis } from '../types/permission'
import { moduleRegistry } from '../types/permission'

/**
 * Tầng 3 (Quyền) và tầng 4 (Phạm vi dữ liệu) của mô hình phân quyền.
 * Mọi hàm ở đây nhận RoleDefinition đã tra sẵn để không phụ thuộc React context —
 * nhờ vậy dùng được cả trong component lẫn trong hàm ghi dữ liệu của context.
 */

/** Quyền: vai trò có bật module đó và có tick hành động đó không. */
export function roleCan(role: RoleDefinition | undefined, key: PermissionKey): boolean {
  if (!role) return false
  if (role.isSuper) return true
  const [moduleKey] = key.split('.') as [ModuleKey, ActionKey]
  if (!role.enabledModules.includes(moduleKey)) return false
  return role.permissions.includes(key)
}

/** Vai trò có bật ít nhất một hành động nào của module không — dùng cho menu và chặn route. */
export function roleCanUseModule(role: RoleDefinition | undefined, moduleKey: ModuleKey): boolean {
  if (!role) return false
  if (role.isSuper) return true
  if (!role.enabledModules.includes(moduleKey)) return false
  return role.permissions.some((p) => p.startsWith(`${moduleKey}.`))
}

/**
 * Phạm vi dữ liệu: null / thiếu = "Tất cả".
 * Trả về null nghĩa là không giới hạn.
 */
export function roleScope(role: RoleDefinition | undefined, axis: ScopeAxis): string[] | null {
  if (!role || role.isSuper) return null
  const selection = role.scopes[axis]
  return selection === undefined ? null : selection
}

/** Một giá trị cụ thể (id hạng mục, tên phòng) có nằm trong phạm vi của vai trò không. */
export function inScope(role: RoleDefinition | undefined, axis: ScopeAxis, value: string | undefined): boolean {
  const scope = roleScope(role, axis)
  if (scope === null) return true
  if (!value) return false
  return scope.includes(value)
}

/** Danh sách trục phạm vi mà một module khai báo hỗ trợ. */
export function scopeAxesOf(moduleKey: ModuleKey): ScopeAxis[] {
  return moduleRegistry.find((m) => m.key === moduleKey)?.scopeAxes ?? []
}

/* ------------------------------------------------------------------ */
/* Khớp nhãn minh chứng với hạng mục                                    */
/* ------------------------------------------------------------------ */

/** Bỏ dấu, tách từ để so khớp nhãn không phụ thuộc cách gõ. */
function normalizeText(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

/**
 * Minh chứng lưu nhãn ngắn ("Clip DTLO") chứ không phải tiêu đề hạng mục đầy đủ
 * ("Sản xuất 1 clip chất lượng cho (ĐTLO duyệt)"), nên phải so khớp theo từ khóa
 * trên cả tiêu đề, tên mốc điểm và danh sách dự án.
 */
export function findCategoryByLabel(categoryLabel: string, categories: Category[]): Category | undefined {
  const exact = categories.find((c) => c.title === categoryLabel)
  if (exact) return exact

  const labelTokens = normalizeText(categoryLabel)
  if (labelTokens.length === 0) return undefined

  let best: { category: Category; score: number } | undefined
  for (const category of categories) {
    const haystack = new Set(
      normalizeText(
        [category.title, ...category.pointOptions.map((o) => o.label), ...(category.locationLabels ?? [])].join(' '),
      ),
    )
    if (!labelTokens.every((token) => haystack.has(token))) continue
    if (!best || labelTokens.length > best.score) best = { category, score: labelTokens.length }
  }
  return best?.category
}

/**
 * Quyền duyệt một minh chứng = có quyền evidence.approve/reject VÀ hạng mục của nó
 * nằm trong phạm vi dữ liệu của vai trò.
 */
export function canDecideSubmission(
  role: RoleDefinition | undefined,
  action: 'approve' | 'reject',
  categoryLabel: string,
  categories: Category[],
): boolean {
  if (!roleCan(role, `evidence.${action}`)) return false
  const scope = roleScope(role, 'category')
  if (scope === null) return true
  const category = findCategoryByLabel(categoryLabel, categories)
  return category ? scope.includes(category.id) : false
}

/** Câu mô tả phạm vi duyệt, hiện dưới tiêu đề trang Chấm điểm. */
export function approvalScopeNote(role: RoleDefinition | undefined, categories: Category[]): string {
  if (!roleCan(role, 'evidence.approve') && !roleCan(role, 'evidence.reject')) {
    return 'Bạn không có quyền duyệt minh chứng.'
  }
  const scope = roleScope(role, 'category')
  if (scope === null) return 'Bạn được duyệt / từ chối mọi hạng mục.'
  const names = categories.filter((c) => scope.includes(c.id)).map((c) => c.title)
  if (names.length === 0) return 'Bạn chưa được giao duyệt hạng mục nào.'
  return `Bạn được duyệt / từ chối ${names.length} hạng mục: ${names.join(', ')}.`
}

/** Mô tả ngắn phạm vi hạng mục của một vai trò, dùng trong bảng tổng quan. */
export function categoryScopeSummary(role: RoleDefinition, categories: Category[]): string {
  const scope = roleScope(role, 'category')
  if (scope === null) return 'Tất cả'
  if (scope.length === 0) return 'Chưa giao'
  if (scope.length === 1) return categories.find((c) => c.id === scope[0])?.title ?? scope[0]
  if (scope.length === categories.length) return 'Tất cả'
  return `${scope.length} hạng mục`
}
