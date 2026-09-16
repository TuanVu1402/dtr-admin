import { useEffect, useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { roleLabels, type AdminUser, type Role } from '../../types/dtr'
import { formatPoints, getInitials } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import ImportExcelModal from '../../components/modal/ImportExcelModal'
import HoverPreview from '../../components/ui/HoverPreview'
import Pagination from '../../components/ui/Pagination'
import UserFormModal, { type UserFormValues } from '../../components/modal/UserFormModal'
import UserDetailModal from '../../components/modal/UserDetailModal'
import ConfirmDialog from '../../components/modal/ConfirmDialog'
import { DownloadIcon, EditIcon, SearchIcon, TrashIcon } from '../../components/ui/icons'
import SortableHeaderCell, { compareValues, nextSortState, type SortDir } from '../../components/ui/SortableHeaderCell'
import TrainingQrSection from './TrainingQrSection'

type UserSortKey = 'name' | 'room' | 'email' | 'role' | 'points'

const roleChipClass: Record<Role, string> = {
  user: 'bg-[rgba(159,176,201,0.14)] text-(--text-secondary) border-[rgba(159,176,201,0.35)]',
  admin: 'bg-[rgba(37,99,235,0.12)] text-(--gold-bright) border-[rgba(37,99,235,0.4)]',
  manager: 'bg-[rgba(76,175,130,0.14)] text-(--positive) border-[rgba(76,175,130,0.4)]',
  support_admin: 'bg-[rgba(217,122,108,0.14)] text-(--negative) border-[rgba(217,122,108,0.4)]',
}

const btnSecondaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
const uRowGridClass = 'grid min-w-[820px] grid-cols-[1.2fr_1fr_1.6fr_0.9fr_0.8fr_0.9fr] items-center gap-3 px-6 py-4'

const USERS_PAGE_SIZE = 10

const roleFilters: { label: string; value: Role | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Người dùng', value: 'user' },
  { label: 'Manager', value: 'manager' },
  { label: 'Admin', value: 'admin' },
  { label: 'Support Admin', value: 'support_admin' },
]

type AdminUsersPanelProps = {
  /** Support Admin nhúng lại panel này nhưng không cần bộ lọc theo vai trò — vì trang đó vốn
   * đã dành cho người có toàn quyền, lọc vai trò ở đây chỉ thừa. */
  showRoleFilter?: boolean
  /** Tạo QR thuộc Admin. Trang Support tắt cờ này rồi tự đặt khối QR xuống cuối trang. */
  showQrSection?: boolean
}

export default function AdminUsersPanel({ showRoleFilter = true, showQrSection = true }: AdminUsersPanelProps) {
  const { submissions, users, addUser, updateUser, deleteUser } = useSubmissions()
  const [showImportModal, setShowImportModal] = useState(false)

  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [userPage, setUserPage] = useState(1)
  const [userSortKey, setUserSortKey] = useState<UserSortKey | null>(null)
  const [userSortDir, setUserSortDir] = useState<SortDir>('asc')

  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  const userTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const s of submissions) {
      if (s.status !== 'approved') continue
      totals.set(s.userName, (totals.get(s.userName) ?? 0) + s.points)
    }
    return totals
  }, [submissions])

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!keyword) return true
      return u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    })
  }, [users, userSearch, roleFilter])

  const sortedUsers = useMemo(() => {
    if (!userSortKey) return filteredUsers
    const getValue = (u: (typeof filteredUsers)[number]): string | number => {
      switch (userSortKey) {
        case 'name':
          return u.name
        case 'room':
          return u.room ?? ''
        case 'email':
          return u.email
        case 'role':
          return roleLabels[u.role]
        case 'points':
          return userTotals.get(u.name) ?? 0
      }
    }
    return [...filteredUsers].sort((a, b) => compareValues(getValue(a), getValue(b), userSortDir))
  }, [filteredUsers, userSortKey, userSortDir, userTotals])

  const userTotalPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PAGE_SIZE))

  useEffect(() => {
    setUserPage((p) => Math.min(p, userTotalPages))
  }, [userTotalPages])

  const visibleUsers = sortedUsers.slice((userPage - 1) * USERS_PAGE_SIZE, userPage * USERS_PAGE_SIZE)

  function handleUserSort(key: UserSortKey) {
    const next = nextSortState(userSortKey, userSortDir, key)
    setUserSortKey(next.key)
    setUserSortDir(next.dir)
  }

  function handleUserSearchChange(value: string) {
    setUserSearch(value)
    setUserPage(1)
  }

  function handleRoleFilterChange(value: Role | 'all') {
    setRoleFilter(value)
    setUserPage(1)
  }

  function userSubmissions(user: AdminUser) {
    return submissions.filter((s) => s.userName === user.name)
  }

  function handleAddUser(values: UserFormValues) {
    addUser(values.name, values.email, values.role, values.room || undefined)
    setShowAddUserForm(false)
  }

  function handleEditUser(values: UserFormValues) {
    if (!editingUser) return
    updateUser(editingUser.id, { name: values.name, email: values.email, role: values.role, room: values.room || undefined })
    setEditingUser(null)
  }

  function handleConfirmDelete() {
    if (!deletingUser) return
    deleteUser(deletingUser.id)
    if (viewingUser?.id === deletingUser.id) setViewingUser(null)
    setDeletingUser(null)
  }

  function handleExportUsers() {
    exportCsv(
      `danh-sach-nguoi-dung-dtr-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Họ tên', 'Phòng', 'Email', 'Vai trò', 'Tổng điểm'],
      users.map((u) => [
        u.name,
        u.room ?? '—',
        u.email,
        roleLabels[u.role],
        formatPoints(userTotals.get(u.name) ?? 0),
      ]),
    )
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
            Quản lý người dùng
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Danh sách người dùng và vai trò tương ứng trong hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnSecondaryClass} onClick={() => setShowImportModal(true)}>
            Nhập từ Excel
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 ${btnPrimaryClass}`}
            onClick={handleExportUsers}
          >
            <DownloadIcon size={15} /> Xuất Excel
          </button>
          <button type="button" className={btnPrimaryClass} onClick={() => setShowAddUserForm(true)}>
            + Thêm người dùng
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex min-w-[220px] flex-1 items-center">
            <span className="pointer-events-none absolute left-3.5">
              <SearchIcon size={16} />
            </span>
            <input
              className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) py-[11px] pr-3.5 pl-[38px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={userSearch}
              onChange={(e) => handleUserSearchChange(e.target.value)}
            />
          </div>
        </div>

        {showRoleFilter && (
          <div className="flex flex-wrap gap-2.5">
            {roleFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`cursor-pointer rounded-full border px-4.5 py-2.5 font-inherit text-[13px] font-bold ${
                  filter.value === roleFilter
                    ? 'border-(--gold) bg-(--gold) text-(--on-gold)'
                    : 'border-[rgba(37,99,235,0.25)] bg-transparent text-(--text-secondary)'
                }`}
                onClick={() => handleRoleFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
          <div
            className={`${uRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}
          >
            <SortableHeaderCell label="Họ tên" sortKey="name" activeKey={userSortKey} dir={userSortDir} onSort={handleUserSort} />
            <SortableHeaderCell label="Phòng" sortKey="room" activeKey={userSortKey} dir={userSortDir} onSort={handleUserSort} />
            <SortableHeaderCell label="Email" sortKey="email" activeKey={userSortKey} dir={userSortDir} onSort={handleUserSort} />
            <SortableHeaderCell label="Vai trò" sortKey="role" activeKey={userSortKey} dir={userSortDir} onSort={handleUserSort} />
            <SortableHeaderCell label="Tổng điểm" sortKey="points" activeKey={userSortKey} dir={userSortDir} onSort={handleUserSort} />
            <div>Thao tác</div>
          </div>
          {filteredUsers.length === 0 && (
            <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Không tìm thấy người dùng phù hợp.</p>
          )}
          {visibleUsers.map((user) => (
            <div className={`${uRowGridClass} border-t border-(--hairline)`} key={user.id}>
              <HoverPreview text={`${user.room ?? 'Chưa gán phòng'}\n${user.email}\n${roleLabels[user.role]}`}>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2.5 border-none bg-none p-0 text-left font-inherit hover:text-(--gold-bright)"
                  onClick={() => setViewingUser(user)}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-[11px] font-bold text-(--on-gold)">
                    {user.avatarUrl ? (
                      <img className="h-full w-full object-cover" src={user.avatarUrl} alt={user.name} />
                    ) : (
                      getInitials(user.name)
                    )}
                  </span>
                  <span className="text-sm font-bold text-(--text-primary) underline decoration-[rgba(37,99,235,0.4)] decoration-dotted underline-offset-[3px]">
                    {user.name}
                  </span>
                </button>
              </HoverPreview>
              <div className="text-[13.5px] font-semibold text-(--text-secondary)">{user.room ?? '—'}</div>
              <div className="text-[13.5px] text-(--text-tertiary)">{user.email}</div>
              <div>
                <span
                  className={`inline-flex w-fit rounded-full border px-[13px] py-[7px] text-xs font-bold ${roleChipClass[user.role]}`}
                >
                  {roleLabels[user.role]}
                </span>
              </div>
              <div className="font-['Open_Sans',sans-serif] text-sm font-extrabold text-(--gold-bright)">
                {formatPoints(userTotals.get(user.name) ?? 0)}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[rgba(37,99,235,0.25)] bg-transparent text-(--gold-bright) hover:bg-[rgba(37,99,235,0.08)]"
                  aria-label="Sửa người dùng"
                  onClick={() => setEditingUser(user)}
                >
                  <EditIcon size={14} />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[rgba(217,122,108,0.3)] bg-transparent text-(--negative) hover:bg-[rgba(217,122,108,0.1)]"
                  aria-label="Xóa người dùng"
                  onClick={() => setDeletingUser(user)}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-[12.5px] text-(--text-tertiary)">
              Hiện {visibleUsers.length}/{filteredUsers.length} người dùng — trang {userPage}/{userTotalPages}
            </span>
            <Pagination page={userPage} totalPages={userTotalPages} onChange={setUserPage} />
          </div>
        )}
      </div>

      {showQrSection && <TrainingQrSection />}

      {showImportModal && (
        <ImportExcelModal
          eyebrow="Quản lý người dùng"
          title="Nhập danh sách người dùng từ Excel"
          description="Tải lên file danh sách người dùng để tạo tài khoản hàng loạt thay vì nhập tay từng người."
          columns={['Họ tên', 'Phòng', 'Email', 'Vai trò']}
          sampleRows={[
            ['Nguyễn Văn Bình', 'Phòng Kinh doanh 1', 'binh.nguyen@dtr.vn', 'Người dùng'],
            ['Lê Thị Cẩm', 'Phòng Kinh doanh 2', 'cam.le@dtr.vn', 'Người dùng'],
          ]}
          templateFilename="mau-nhap-nguoi-dung-dtr.csv"
          onCancel={() => setShowImportModal(false)}
          onImport={() => {
            // TODO: đọc và parse file Excel thành danh sách người dùng khi có thư viện xử lý file ở backend/BE.
            setShowImportModal(false)
          }}
        />
      )}

      {showAddUserForm && (
        <UserFormModal onCancel={() => setShowAddUserForm(false)} onSubmit={handleAddUser} />
      )}

      {editingUser && (
        <UserFormModal user={editingUser} onCancel={() => setEditingUser(null)} onSubmit={handleEditUser} />
      )}

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          submissions={userSubmissions(viewingUser)}
          totalPoints={userTotals.get(viewingUser.name) ?? 0}
          onClose={() => setViewingUser(null)}
          onEdit={() => {
            setEditingUser(viewingUser)
            setViewingUser(null)
          }}
          onDelete={() => setDeletingUser(viewingUser)}
        />
      )}

      {deletingUser && (
        <ConfirmDialog
          title="Xóa người dùng"
          message={`Bạn có chắc muốn xóa "${deletingUser.name}"? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa"
          danger
          onCancel={() => setDeletingUser(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  )
}
