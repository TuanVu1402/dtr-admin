import { useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { useCategories } from '../../context/CategoriesContext'
import { useRoles } from '../../context/RolesContext'
import { useAuth } from '../../context/AuthContext'
import { useAudit } from '../../context/AuditContext'
import { useNotifications } from '../../context/NotificationsContext'
import { usePermissions } from '../../utils/usePermissions'
import { categoryScopeSummary } from '../../utils/permissions'
import { moduleRegistry, type RoleDefinition } from '../../types/permission'
import PermissionModal from '../../components/modal/PermissionModal'
import RoleFormModal from '../../components/modal/RoleFormModal'
import ConfirmDialog from '../../components/modal/ConfirmDialog'
import UserAvatar from '../../components/ui/UserAvatar'
import Pagination from '../../components/ui/Pagination'
import SearchableSelect from '../../components/form/SearchableSelect'
import { EditIcon, KeyIcon, SearchIcon, TrashIcon } from '../../components/ui/icons'

const USERS_PAGE_SIZE = 10
const roleGridClass = 'grid min-w-[840px] grid-cols-[1.5fr_1.1fr_0.9fr_1fr_1.1fr] items-center gap-3 px-6 py-4'
const userRowGridClass = 'grid min-w-[760px] grid-cols-[1.4fr_1.2fr_1.4fr_1fr] items-center gap-3 px-6 py-4'

const btnSecondaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
const iconBtnClass =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[rgba(37,99,235,0.25)] bg-transparent text-(--gold-bright) hover:bg-[rgba(37,99,235,0.08)]'

export default function RolesPanel() {
  const { users, updateUser } = useSubmissions()
  const { categories } = useCategories()
  const { roles, roleName, createRole, updateRole, deleteRole } = useRoles()
  const { profile, role: currentRoleId } = useAuth()
  const { logAudit } = useAudit()
  const { pushNotification } = useNotifications()
  const { can } = usePermissions()

  const canManage = can('roles.manage')
  const canAssign = can('roles.assign')

  const [permissionTarget, setPermissionTarget] = useState<RoleDefinition | null>(null)
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null)
  const [creatingRole, setCreatingRole] = useState(false)
  const [deletingRole, setDeletingRole] = useState<RoleDefinition | null>(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)

  const rooms = useMemo(
    () => Array.from(new Set(users.map((u) => u.room).filter((r): r is string => Boolean(r)))).sort(),
    [users],
  )

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const u of users) counts.set(u.role, (counts.get(u.role) ?? 0) + 1)
    return counts
  }, [users])

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!keyword) return true
      return u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    })
  }, [users, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PAGE_SIZE))
  const visibleUsers = filteredUsers.slice((page - 1) * USERS_PAGE_SIZE, page * USERS_PAGE_SIZE)

  function moduleSummary(role: RoleDefinition): string {
    if (role.isSuper) return 'Toàn bộ chức năng'
    if (role.enabledModules.length === 0) return 'Chưa có chức năng nào'
    return moduleRegistry
      .filter((m) => role.enabledModules.includes(m.key))
      .map((m) => m.label.replace(/^Quản lý /, ''))
      .join(', ')
  }

  function handleSavePermissions(updates: Pick<RoleDefinition, 'enabledModules' | 'permissions' | 'scopes'>) {
    if (!permissionTarget || !currentRoleId) return
    updateRole(permissionTarget.id, updates)
    logAudit({
      actor: profile.name,
      actorRole: currentRoleId,
      action: 'update_role',
      target: permissionTarget.name,
      detail: `${updates.permissions.length} quyền trên ${updates.enabledModules.length} chức năng`,
    })
    pushNotification({
      kind: 'success',
      title: 'Đã lưu phân quyền',
      description: permissionTarget.name,
    })
    setPermissionTarget(null)
  }

  function handleChangeUserRole(userId: string, userName: string, previous: string, next: string) {
    if (previous === next || !currentRoleId) return
    updateUser(userId, { role: next })
    logAudit({
      actor: profile.name,
      actorRole: currentRoleId,
      action: 'change_role',
      target: userName,
      detail: `${roleName(previous)} → ${roleName(next)}`,
    })
    pushNotification({
      kind: 'success',
      title: 'Đã đổi vai trò',
      description: `${userName}: ${roleName(previous)} → ${roleName(next)}`,
    })
  }

  function handleDeleteRole() {
    if (!deletingRole || !currentRoleId) return
    // Người đang giữ vai trò bị xóa sẽ rơi về "Người dùng" để không mắc kẹt với vai trò không tồn tại.
    for (const u of users.filter((u) => u.role === deletingRole.id)) updateUser(u.id, { role: 'user' })
    deleteRole(deletingRole.id)
    logAudit({
      actor: profile.name,
      actorRole: currentRoleId,
      action: 'delete_role',
      target: deletingRole.name,
    })
    setDeletingRole(null)
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-4 max-[640px]:pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary) max-[640px]:text-[22px]">
            Phân quyền
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary) max-[640px]:hidden">
            Người dùng → Vai trò → Quyền → Phạm vi dữ liệu. Tạo vai trò mới, tick chức năng cho nó, rồi gán cho người
            dùng.
          </p>
        </div>
        {canManage && (
          <button type="button" className={btnPrimaryClass} onClick={() => setCreatingRole(true)}>
            + Thêm vai trò
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-bold tracking-[1.4px] text-(--text-tertiary) uppercase">Danh sách vai trò</div>
        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
          <div className={`${roleGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}>
            <div>Vai trò</div>
            <div>Chức năng</div>
            <div>Phạm vi hạng mục</div>
            <div>Số tài khoản</div>
            <div>Thao tác</div>
          </div>
          {roles.map((role) => (
            <div className={`${roleGridClass} border-t border-(--hairline)`} key={role.id}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-(--text-primary)">{role.name}</span>
                  {role.isSuper && (
                    <span className="rounded border border-[rgba(217,122,108,0.4)] bg-[rgba(217,122,108,0.14)] px-1.5 py-0.5 text-[10.5px] font-bold text-(--negative)">
                      Cao nhất
                    </span>
                  )}
                  {role.system && !role.isSuper && (
                    <span className="rounded border border-[rgba(37,99,235,0.3)] px-1.5 py-0.5 text-[10.5px] font-bold text-(--text-tertiary)">
                      Hệ thống
                    </span>
                  )}
                </div>
                {role.description && (
                  <div className="mt-0.5 text-[12px] leading-[1.45] text-(--text-tertiary)">{role.description}</div>
                )}
              </div>
              <div className="text-[12.5px] text-(--text-secondary)">{moduleSummary(role)}</div>
              <div className="text-[12.5px] font-semibold text-(--gold-bright)">
                {categoryScopeSummary(role, categories)}
              </div>
              <div className="text-[13px] font-bold text-(--text-secondary)">{roleCounts.get(role.id) ?? 0}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={iconBtnClass}
                  aria-label={`Phân quyền ${role.name}`}
                  title="Phân quyền chức năng"
                  onClick={() => setPermissionTarget(role)}
                >
                  <KeyIcon size={14} />
                </button>
                {canManage && !role.system && (
                  <>
                    <button
                      type="button"
                      className={iconBtnClass}
                      aria-label={`Sửa ${role.name}`}
                      title="Sửa tên / mô tả"
                      onClick={() => setEditingRole(role)}
                    >
                      <EditIcon size={14} />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[rgba(217,122,108,0.3)] bg-transparent text-(--negative) hover:bg-[rgba(217,122,108,0.1)]"
                      aria-label={`Xóa ${role.name}`}
                      title="Xóa vai trò"
                      onClick={() => setDeletingRole(role)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="text-xs font-bold tracking-[1.4px] text-(--text-tertiary) uppercase">
          Gán vai trò cho người dùng
        </div>

        <div className="flex flex-wrap gap-3.5">
          <div className="relative flex min-w-[240px] flex-1 items-center">
            <span className="pointer-events-none absolute left-3.5">
              <SearchIcon size={16} />
            </span>
            <input
              className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) py-[11px] pr-3.5 pl-[38px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="min-w-[220px]">
            <SearchableSelect
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value)
                setPage(1)
              }}
              placeholder="Lọc theo vai trò..."
              options={[
                { value: 'all', label: 'Tất cả vai trò' },
                ...roles.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
          </div>
        </div>

        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
          <div className={`${userRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}>
            <div>Họ tên</div>
            <div>Phòng</div>
            <div>Email</div>
            <div>Vai trò</div>
          </div>
          {filteredUsers.length === 0 && (
            <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Không tìm thấy tài khoản phù hợp.</p>
          )}
          {visibleUsers.map((user) => (
            <div className={`${userRowGridClass} border-t border-(--hairline)`} key={user.id}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-[11px] font-bold text-(--on-gold)">
                  <UserAvatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} />
                </span>
                <span className="text-sm font-bold text-(--text-primary)">{user.name}</span>
              </div>
              <div className="text-[13.5px] font-semibold text-(--text-secondary)">{user.room ?? '—'}</div>
              <div className="text-[13.5px] break-all text-(--text-tertiary)">{user.email}</div>
              {canAssign ? (
                <select
                  className="w-full cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3 py-2 font-['Open_Sans',sans-serif] text-[13px] font-bold text-(--text-primary) focus:border-(--gold) focus:outline-none"
                  value={user.role}
                  onChange={(e) => handleChangeUserRole(user.id, user.name, user.role, e.target.value)}
                  aria-label={`Vai trò của ${user.name}`}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#fdf8ec] text-[#0d1f3d]">
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[13px] font-semibold text-(--text-secondary)">{roleName(user.role)}</span>
              )}
            </div>
          ))}
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-[12.5px] text-(--text-tertiary)">
              Hiện {visibleUsers.length}/{filteredUsers.length} tài khoản — trang {page}/{totalPages}
            </span>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {permissionTarget && (
        <PermissionModal
          role={permissionTarget}
          categories={categories}
          rooms={rooms}
          onCancel={() => setPermissionTarget(null)}
          onSave={handleSavePermissions}
        />
      )}

      {creatingRole && (
        <RoleFormModal
          existingRoles={roles}
          onCancel={() => setCreatingRole(false)}
          onSubmit={(values) => {
            const created = createRole(values)
            if (currentRoleId) {
              logAudit({
                actor: profile.name,
                actorRole: currentRoleId,
                action: 'create_role',
                target: created.name,
              })
            }
            setCreatingRole(false)
            // Mở luôn modal phân quyền để vai trò mới không nằm trơ không có quyền nào.
            setPermissionTarget(created)
          }}
        />
      )}

      {editingRole && (
        <RoleFormModal
          role={editingRole}
          existingRoles={roles}
          onCancel={() => setEditingRole(null)}
          onSubmit={(values) => {
            updateRole(editingRole.id, { name: values.name, description: values.description || undefined })
            setEditingRole(null)
          }}
        />
      )}

      {deletingRole && (
        <ConfirmDialog
          title="Xóa vai trò"
          message={`Xóa vai trò "${deletingRole.name}"? ${
            roleCounts.get(deletingRole.id) ?? 0
          } tài khoản đang giữ vai trò này sẽ được chuyển về "Người dùng".`}
          confirmLabel="Xóa"
          danger
          onCancel={() => setDeletingRole(null)}
          onConfirm={handleDeleteRole}
        />
      )}

      <div className="flex items-center gap-2 pb-2">
        {!canManage && (
          <button type="button" className={btnSecondaryClass} disabled>
            Bạn chỉ được xem phân quyền
          </button>
        )}
      </div>
    </section>
  )
}
