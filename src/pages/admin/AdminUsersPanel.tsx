import { useMemo, useState, type FormEvent } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { roleLabels, type Role } from '../../types/dtr'
import { formatPoints } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import QrCodeImage from '../../components/QrCodeImage'
import ImportExcelModal from '../../components/ImportExcelModal'
import { DownloadIcon, ExpandIcon, QrIcon, SearchIcon } from '../../components/icons'
import { useTrainingSessions, type TrainingSession } from '../../context/TrainingSessionsContext'
import SortableHeaderCell, { compareValues, nextSortState, type SortDir } from '../../components/SortableHeaderCell'

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
const uRowGridClass = 'grid min-w-[720px] grid-cols-[1.2fr_1fr_1.6fr_0.9fr_0.8fr] items-center gap-3 px-6 py-4'

const USERS_PAGE_SIZE = 20
const USERS_PAGE_STEP = 10

const roleFilters: { label: string; value: Role | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Người dùng', value: 'user' },
  { label: 'Manager', value: 'manager' },
  { label: 'Admin', value: 'admin' },
  { label: 'Support Admin', value: 'support_admin' },
]

function buildCheckinUrl(code: string) {
  return `${window.location.origin}${window.location.pathname}?checkin=${code}`
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

type AdminUsersPanelProps = {
  /** Support Admin nhúng lại panel này nhưng không cần bộ lọc theo vai trò — vì trang đó vốn
   * đã dành cho người có toàn quyền, lọc vai trò ở đây chỉ thừa. */
  showRoleFilter?: boolean
}

export default function AdminUsersPanel({ showRoleFilter = true }: AdminUsersPanelProps) {
  const { submissions, users } = useSubmissions()
  const { sessions, addSession } = useTrainingSessions()
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionSearch, setSessionSearch] = useState('')
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({})
  const [viewingSession, setViewingSession] = useState<TrainingSession | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [visibleUserCount, setVisibleUserCount] = useState(USERS_PAGE_SIZE)
  const [userSortKey, setUserSortKey] = useState<UserSortKey | null>(null)
  const [userSortDir, setUserSortDir] = useState<SortDir>('asc')

  const filteredSessions = useMemo(() => {
    const keyword = sessionSearch.trim().toLowerCase()
    if (!keyword) return sessions
    return sessions.filter(
      (s) => s.title.toLowerCase().includes(keyword) || s.code.toLowerCase().includes(keyword),
    )
  }, [sessions, sessionSearch])

  function handleDownloadQr(session: TrainingSession) {
    const dataUrl = qrDataUrls[session.code]
    if (!dataUrl) return
    downloadDataUrl(dataUrl, `qr-${session.title.replace(/\s+/g, '-').toLowerCase()}-${session.code}.png`)
  }

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

  const visibleUsers = sortedUsers.slice(0, visibleUserCount)

  function handleUserSort(key: UserSortKey) {
    const next = nextSortState(userSortKey, userSortDir, key)
    setUserSortKey(next.key)
    setUserSortDir(next.dir)
  }

  function handleUserSearchChange(value: string) {
    setUserSearch(value)
    setVisibleUserCount(USERS_PAGE_SIZE)
  }

  function handleRoleFilterChange(value: Role | 'all') {
    setRoleFilter(value)
    setVisibleUserCount(USERS_PAGE_SIZE)
  }

  function handleCreateSession(e: FormEvent) {
    e.preventDefault()
    if (!sessionTitle.trim()) return
    addSession(sessionTitle.trim(), sessionDate)
    setSessionTitle('')
    setSessionDate('')
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
          </div>
          {filteredUsers.length === 0 && (
            <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Không tìm thấy người dùng phù hợp.</p>
          )}
          {visibleUsers.map((user) => (
            <div className={`${uRowGridClass} border-t border-(--hairline)`} key={user.id}>
              <div className="text-sm font-bold text-(--text-primary)">{user.name}</div>
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
            </div>
          ))}
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-[12.5px] text-(--text-tertiary)">
              Hiện {visibleUsers.length}/{filteredUsers.length} người dùng
            </span>
            {visibleUserCount < filteredUsers.length && (
              <button
                type="button"
                className="cursor-pointer rounded-full border border-[rgba(37,99,235,0.28)] bg-transparent px-4 py-[7px] font-inherit text-[12.5px] font-bold text-(--gold-bright) transition-[background,border-color] duration-150 hover:border-[rgba(37,99,235,0.45)] hover:bg-[rgba(37,99,235,0.08)]"
                onClick={() => setVisibleUserCount((v) => Math.min(v + USERS_PAGE_STEP, filteredUsers.length))}
              >
                Xem thêm
              </button>
            )}
            {visibleUserCount > USERS_PAGE_SIZE && (
              <button
                type="button"
                className="cursor-pointer rounded-full border border-(--hairline) bg-transparent px-4 py-[7px] font-inherit text-[12.5px] font-bold text-(--text-tertiary) transition-[background,border-color] duration-150 hover:border-(--text-tertiary) hover:bg-(--surface-tint)"
                onClick={() => setVisibleUserCount(USERS_PAGE_SIZE)}
              >
                Thu gọn
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-6 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-1) p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[rgba(37,99,235,0.25)] bg-[rgba(37,99,235,0.1)] text-(--gold)">
            <QrIcon size={22} />
          </div>
          <div>
            <div className="font-['Open_Sans',sans-serif] text-lg font-extrabold tracking-[0.3px] text-(--text-primary)">
              Tạo mã QR điểm danh Training / Kick off
            </div>
            <p className="m-0 mt-1 text-sm font-medium text-(--text-tertiary)">
              Tạo buổi Training rồi chiếu mã QR lên màn hình — user quét mã bằng camera điện thoại sẽ tự động được
              ghi nhận 1 điểm DTR, không cần chờ duyệt.
            </p>
          </div>
        </div>

        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-[rgba(37,99,235,0.16)] bg-(--surface-tint) p-4"
          onSubmit={handleCreateSession}
        >
          <div className="flex min-w-[220px] flex-1 flex-col gap-2">
            <label className="text-[12.5px] font-bold text-(--text-secondary)">Tên buổi</label>
            <input
              className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-1) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
              type="text"
              placeholder="Tên buổi Training / Kick off"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex min-w-[170px] flex-col gap-2">
            <label className="text-[12.5px] font-bold text-(--text-secondary)">Ngày diễn ra</label>
            <input
              className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-1) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-6 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
          >
            <QrIcon size={16} /> Tạo mã QR
          </button>
        </form>

        {sessions.length === 0 ? (
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">Chưa có buổi Training nào được tạo.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12.5px] font-bold text-(--text-secondary)">
                Đã tạo {sessions.length} buổi — bấm vào một buổi để chiếu mã QR lớn lên màn hình.
              </div>
              {sessions.length > 5 && (
                <div className="relative flex min-w-[200px] items-center">
                  <span className="pointer-events-none absolute left-3">
                    <SearchIcon size={14} />
                  </span>
                  <input
                    className="w-full rounded-full border border-[rgba(37,99,235,0.25)] bg-(--surface-1) py-2 pr-3.5 pl-8 text-[13px] text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
                    type="text"
                    placeholder="Tìm theo tên hoặc mã..."
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto rounded-xl border border-[rgba(37,99,235,0.16)] bg-(--surface-tint) p-2">
              {filteredSessions.length === 0 && (
                <p className="m-0 px-3 py-4 text-center text-[13px] text-(--text-tertiary)">
                  Không tìm thấy buổi phù hợp.
                </p>
              )}
              {filteredSessions.map((session) => (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-3.5 rounded-lg border border-transparent bg-(--surface-1) px-3.5 py-2.5 text-left transition-[border-color,box-shadow] duration-150 hover:border-[rgba(37,99,235,0.3)] hover:shadow-[0_4px_12px_var(--shadow)]"
                  key={session.code}
                  onClick={() => setViewingSession(session)}
                >
                  <div className="shrink-0 overflow-hidden rounded-md border border-[rgba(37,99,235,0.16)]">
                    <QrCodeImage
                      value={buildCheckinUrl(session.code)}
                      size={44}
                      onReady={(url) => setQrDataUrls((prev) => ({ ...prev, [session.code]: url }))}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-['Open_Sans',sans-serif] text-sm font-bold text-(--text-primary)">
                      {session.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-(--text-tertiary)">
                      {session.date && <span>{session.date}</span>}
                      <span className="tracking-[1px] text-(--gold-bright)">Mã: {session.code}</span>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(37,99,235,0.28)] px-3 py-1.5 text-xs font-bold text-(--gold-bright)">
                    <ExpandIcon size={13} /> Xem lớn
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewingSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
          onClick={() => setViewingSession(null)}
        >
          <div
            className="flex w-full max-w-[360px] flex-col items-center gap-5 rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 text-center shadow-[0_30px_60px_var(--shadow-strong)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-start justify-between gap-4">
              <div className="text-left">
                <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">
                  Chiếu mã QR điểm danh
                </div>
                <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
                  {viewingSession.title}
                </div>
              </div>
              <button
                type="button"
                className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
                onClick={() => setViewingSession(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-white p-4">
              <QrCodeImage
                value={buildCheckinUrl(viewingSession.code)}
                size={260}
                onReady={(url) => setQrDataUrls((prev) => ({ ...prev, [viewingSession.code]: url }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              {viewingSession.date && (
                <div className="text-[13px] text-(--text-tertiary)">{viewingSession.date}</div>
              )}
              <div className="text-[12.5px] tracking-[1px] text-(--gold-bright)">Mã: {viewingSession.code}</div>
            </div>

            <div className="flex w-full gap-3">
              <button
                type="button"
                className="min-h-11 flex-1 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
                onClick={() => setViewingSession(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
                onClick={() => handleDownloadQr(viewingSession)}
              >
                <DownloadIcon size={15} /> Tải ảnh QR
              </button>
            </div>
          </div>
        </div>
      )}

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
    </section>
  )
}
