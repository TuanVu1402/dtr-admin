import { useEffect, useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { useAuth } from '../../context/AuthContext'
import { useAudit } from '../../context/AuditContext'
import { useNotifications } from '../../context/NotificationsContext'
import type { AdminSubmission, SubmissionStatus } from '../../types/dtr'
import { formatPoints, parseVNDate } from '../../utils/format'
import UserAvatar from '../../components/ui/UserAvatar'
import { parseCsvText, parseStatusLabel, readFileAsText } from '../../utils/parseCsv'
import EvidenceModal from '../../components/modal/EvidenceModal'
import HoverPreview from '../../components/ui/HoverPreview'
import RejectReasonModal from '../../components/modal/RejectReasonModal'
import ManualEntryForm from '../../components/form/ManualEntryForm'
import ImportExcelModal from '../../components/modal/ImportExcelModal'
import { SearchIcon } from '../../components/ui/icons'
import Pagination from '../../components/ui/Pagination'
import SearchableSelect from '../../components/form/SearchableSelect'
import SortableHeaderCell, { compareValues, nextSortState, type SortDir } from '../../components/ui/SortableHeaderCell'
import { clipApprovalCategoryLabel } from '../../utils/roles'

type SubmissionSortKey = 'user' | 'category' | 'date' | 'points'

const statusFilters: { label: string; value: SubmissionStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
]

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'
const btnSecondaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold) disabled:cursor-not-allowed disabled:opacity-50"
const sRowGridClass = 'grid min-w-[920px] grid-cols-[1.1fr_1fr_1.8fr_0.9fr_0.6fr_1.4fr] items-center gap-3 px-6 py-4'

const SUBMISSIONS_PAGE_SIZE = 10

function actionBtnClass(kind: 'approve' | 'reject', state: 'active' | 'muted' | '') {
  const base = "cursor-pointer rounded-lg border px-3 py-2 font-['Open_Sans',sans-serif] text-[12.5px] font-bold transition-[transform,background,box-shadow,opacity] duration-150"

  // Chờ duyệt (chưa quyết định) — cả 2 nút giữ dáng vẻ trung tính, không tô màu nào để
  // tránh gây hiểu lầm là đã chọn sẵn.
  if (state === '') {
    return `${base} border-[rgba(37,99,235,0.2)] bg-transparent text-(--text-secondary) hover:border-[rgba(37,99,235,0.4)] hover:bg-[rgba(37,99,235,0.06)]`
  }

  if (state === 'active') {
    return kind === 'approve'
      ? `${base} border-(--positive) bg-[rgba(76,175,130,0.3)] font-extrabold text-(--positive)`
      : `${base} border-(--negative) bg-[rgba(217,122,108,0.3)] font-extrabold text-(--negative)`
  }

  // muted — vẫn thấy màu nhẹ để biết đây là lựa chọn ngược lại với trạng thái đã chọn,
  // nhưng mờ đi để không nổi hơn nút đang active.
  return kind === 'approve'
    ? `${base} border-[rgba(76,175,130,0.4)] bg-[rgba(76,175,130,0.14)] text-(--positive) opacity-40`
    : `${base} border-[rgba(217,122,108,0.4)] bg-[rgba(217,122,108,0.14)] text-(--negative) opacity-40`
}

export default function ManagerPanel() {
  const { submissions, users, setStatus, rejectSubmission, addSubmission, addSubmissions } = useSubmissions()
  const { role, profile } = useAuth()
  const { logAudit } = useAudit()
  const { pushNotification } = useNotifications()
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [roomFilter, setRoomFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null)
  const [rejectingSubmission, setRejectingSubmission] = useState<AdminSubmission | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SubmissionSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  /** GĐDA / ĐTLO chỉ được duyệt đúng 1 hạng mục clip chất lượng của mình. */
  const restrictedCategoryLabel = role ? clipApprovalCategoryLabel[role] : undefined
  const scopedSubmissions = useMemo(
    () => (restrictedCategoryLabel ? submissions.filter((s) => s.categoryLabel === restrictedCategoryLabel) : submissions),
    [submissions, restrictedCategoryLabel],
  )

  const stats = useMemo(() => {
    return {
      pending: scopedSubmissions.filter((s) => s.status === 'pending').length,
      approved: scopedSubmissions.filter((s) => s.status === 'approved').length,
      rejected: scopedSubmissions.filter((s) => s.status === 'rejected').length,
    }
  }, [scopedSubmissions])

  const userByName = useMemo(() => new Map(users.map((u) => [u.name, u])), [users])

  const categoryOptions = useMemo(
    () => Array.from(new Set(scopedSubmissions.map((s) => s.categoryLabel))).sort(),
    [scopedSubmissions],
  )
  const userOptions = useMemo(
    () => Array.from(new Set(scopedSubmissions.map((s) => s.userName))).sort(),
    [scopedSubmissions],
  )
  const roomOptions = useMemo(
    () => Array.from(new Set(users.map((u) => u.room).filter((room): room is string => Boolean(room)))).sort(),
    [users],
  )

  const filteredSubmissions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return scopedSubmissions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (categoryFilter !== 'all' && s.categoryLabel !== categoryFilter) return false
      if (userFilter !== 'all' && s.userName !== userFilter) return false
      if (roomFilter !== 'all' && userByName.get(s.userName)?.room !== roomFilter) return false
      if (keyword) {
        const haystack = `${s.userName} ${s.categoryLabel} ${s.description}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      return true
    })
  }, [scopedSubmissions, statusFilter, categoryFilter, userFilter, roomFilter, searchTerm, userByName])

  const sortedSubmissions = useMemo(() => {
    if (!sortKey) return filteredSubmissions
    const getValue = (s: AdminSubmission): string | number => {
      switch (sortKey) {
        case 'user':
          return s.userName
        case 'category':
          return s.categoryLabel
        case 'date':
          return parseVNDate(s.date).getTime()
        case 'points':
          return s.points
      }
    }
    return [...filteredSubmissions].sort((a, b) => compareValues(getValue(a), getValue(b), sortDir))
  }, [filteredSubmissions, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedSubmissions.length / SUBMISSIONS_PAGE_SIZE))
  const visibleSubmissions = sortedSubmissions.slice((page - 1) * SUBMISSIONS_PAGE_SIZE, page * SUBMISSIONS_PAGE_SIZE)

  function handleSort(key: SubmissionSortKey) {
    const next = nextSortState(sortKey, sortDir, key)
    setSortKey(next.key)
    setSortDir(next.dir)
  }

  useEffect(() => {
    setPage(1)
  }, [statusFilter, categoryFilter, userFilter, roomFilter, searchTerm])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-4 max-[640px]:pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] tracking-[0.5px] text-(--text-primary)">
            Chấm điểm minh chứng
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary) max-[640px]:hidden">
            {restrictedCategoryLabel
              ? `Chỉ duyệt hạng mục: ${restrictedCategoryLabel}`
              : 'Xem minh chứng người dùng đã nộp và duyệt / từ chối để chấm điểm.'}
          </p>
        </div>
        {!restrictedCategoryLabel && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={btnSecondaryClass} onClick={() => setShowImportModal(true)}>
              Nhập từ Excel
            </button>
            <button type="button" className={btnPrimaryClass} onClick={() => setShowManualForm(true)}>
              + Thêm minh chứng
            </button>
          </div>
        )}
      </div>

      {importMessage && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[rgba(37,99,235,0.25)] bg-[rgba(37,99,235,0.08)] px-4 py-3 text-[13px] text-(--text-primary)">
          <span>{importMessage}</span>
          <button type="button" className="cursor-pointer border-none bg-transparent text-lg" onClick={() => setImportMessage(null)}>
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 max-[640px]:gap-2">
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--gold-bright)">{stats.pending}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Chờ duyệt</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--positive)">{stats.approved}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Đã duyệt</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--negative)">{stats.rejected}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Từ chối</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`cursor-pointer rounded-full border px-4.5 py-2.5 font-inherit text-[13px] font-bold max-[640px]:px-3 max-[640px]:py-1.5 max-[640px]:text-[12.5px] ${
              filter.value === statusFilter
                ? 'border-(--gold) bg-(--gold) text-(--on-gold)'
                : 'border-[rgba(37,99,235,0.25)] bg-transparent text-(--text-secondary)'
            }`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-2 max-[640px]:min-w-full">
          <label className={fieldLabelClass} htmlFor="filter-search">
            Tìm kiếm
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5">
              <SearchIcon size={16} />
            </span>
            <input
              id="filter-search"
              className={`pl-[38px] ${fieldInputClass}`}
              type="text"
              placeholder="Tìm theo người nộp, hạng mục, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {!restrictedCategoryLabel && (
          <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
            <label className={fieldLabelClass} htmlFor="filter-category">
              Hạng mục
            </label>
            <SearchableSelect
              id="filter-category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Nhập tên hạng mục..."
              options={[
                { value: 'all', label: 'Tất cả hạng mục' },
                ...categoryOptions.map((label) => ({ value: label, label })),
              ]}
            />
          </div>
        )}
        <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
          <label className={fieldLabelClass} htmlFor="filter-user">
            Người nộp
          </label>
          <SearchableSelect
            id="filter-user"
            value={userFilter}
            onChange={setUserFilter}
            placeholder="Nhập tên người nộp..."
            options={[
              { value: 'all', label: 'Tất cả người nộp' },
              ...userOptions.map((name) => ({ value: name, label: name })),
            ]}
          />
        </div>
        <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
          <label className={fieldLabelClass} htmlFor="filter-room">
            Phòng
          </label>
          <SearchableSelect
            id="filter-room"
            value={roomFilter}
            onChange={setRoomFilter}
            placeholder="Nhập tên phòng..."
            options={[
              { value: 'all', label: 'Tất cả phòng' },
              ...roomOptions.map((room) => ({ value: room, label: room })),
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
        <div
          className={`${sRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}
        >
          <SortableHeaderCell label="Người nộp" sortKey="user" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <SortableHeaderCell label="Hạng mục" sortKey="category" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <div>Mô tả / minh chứng</div>
          <SortableHeaderCell label="Ngày nộp" sortKey="date" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <SortableHeaderCell label="Điểm" sortKey="points" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <div>Duyệt</div>
        </div>
        {filteredSubmissions.length === 0 && (
          <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Không có minh chứng nào khớp bộ lọc.</p>
        )}
        {visibleSubmissions.map((s) => {
          const submitter = userByName.get(s.userName)
          const userTooltip = submitter
            ? `${submitter.room ?? 'Chưa gán phòng'}\n${submitter.email}`
            : 'Chưa rõ thông tin người dùng'
          const descTooltip = `${s.description}\n\nNgày nộp: ${s.date} • Điểm: ${formatPoints(s.points)}`
          return (
            <div className={`${sRowGridClass} border-t border-(--hairline)`} key={s.id}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-[11px] font-bold text-(--on-gold)">
                  <UserAvatar id={submitter?.id} name={s.userName} avatarUrl={submitter?.avatarUrl} />
                </span>
                <HoverPreview
                  text={userTooltip}
                  className="inline-block w-fit cursor-help text-sm font-bold text-(--text-primary) underline decoration-[rgba(37,99,235,0.4)] decoration-dotted underline-offset-[3px]"
                >
                  {s.userName}
                </HoverPreview>
              </div>
              <div className="text-[13.5px] font-semibold text-(--gold-bright)">{s.categoryLabel}</div>
              <div className="text-[13.5px] text-(--text-tertiary)">
                {s.imageDataUrl ? (
                  <HoverPreview imageUrl={s.imageDataUrl}>
                    <button
                      type="button"
                      className="cursor-pointer border-none bg-none p-0 text-left font-inherit text-[13.5px] text-(--text-tertiary) underline decoration-dotted underline-offset-[3px] hover:text-(--gold-bright)"
                      aria-label="Xem ảnh minh chứng"
                      onClick={() => setSelectedSubmission(s)}
                    >
                      {s.description}
                    </button>
                  </HoverPreview>
                ) : (
                  <HoverPreview text={descTooltip}>
                    <button
                      type="button"
                      className="cursor-pointer border-none bg-none p-0 text-left font-inherit text-[13.5px] text-(--text-tertiary) underline decoration-dotted underline-offset-[3px] hover:text-(--gold-bright)"
                      onClick={() => setSelectedSubmission(s)}
                    >
                      {s.description}
                    </button>
                  </HoverPreview>
                )}
                {s.link && (
                  <>
                    {' '}
                    <a
                      className="text-[12.5px] font-bold whitespace-nowrap text-(--gold-bright)"
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Xem link ↗
                    </a>
                  </>
                )}
              </div>
              <div className="text-[13.5px] text-(--text-secondary)">{s.date}</div>
              <div className="font-['Open_Sans',sans-serif] text-sm font-extrabold text-(--gold-bright)">
                +{formatPoints(s.points)}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={actionBtnClass(
                    'approve',
                    s.status === 'approved' ? 'active' : s.status === 'rejected' ? 'muted' : '',
                  )}
                  onClick={() => {
                    setStatus(s.id, 'approved')
                    if (role) {
                      logAudit({ actor: profile.name, actorRole: role, action: 'approve', target: s.userName, detail: s.categoryLabel })
                      pushNotification({ kind: 'success', title: 'Đã duyệt minh chứng', description: `${s.userName} — ${s.categoryLabel}` })
                    }
                  }}
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  className={actionBtnClass(
                    'reject',
                    s.status === 'rejected' ? 'active' : s.status === 'approved' ? 'muted' : '',
                  )}
                  onClick={() => setRejectingSubmission(s)}
                >
                  Từ chối
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredSubmissions.length > 0 && (
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[12.5px] text-(--text-tertiary)">
            Hiện {visibleSubmissions.length}/{filteredSubmissions.length} minh chứng — trang {page}/{totalPages}
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {selectedSubmission && (
        <EvidenceModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      )}

      {rejectingSubmission && (
        <RejectReasonModal
          submission={rejectingSubmission}
          onCancel={() => setRejectingSubmission(null)}
          onConfirm={(reason) => {
            rejectSubmission(rejectingSubmission.id, reason)
            if (role) {
              logAudit({
                actor: profile.name,
                actorRole: role,
                action: 'reject',
                target: rejectingSubmission.userName,
                detail: reason,
              })
              pushNotification({
                kind: 'warning',
                title: 'Đã từ chối minh chứng',
                description: `${rejectingSubmission.userName} — ${rejectingSubmission.categoryLabel}`,
              })
            }
            setRejectingSubmission(null)
          }}
        />
      )}

      {showManualForm && (
        <ManualEntryForm
          onCancel={() => setShowManualForm(false)}
          onSubmit={(input) => {
            addSubmission(input)
            setShowManualForm(false)
          }}
        />
      )}

      {showImportModal && (
        <ImportExcelModal
          eyebrow="Chấm điểm hàng loạt"
          title="Nhập minh chứng từ file Excel"
          description="Dùng file CSV (Excel → Lưu thành CSV UTF-8). Cột: Người nộp, Phòng, Hạng mục, Điểm, Ngày, Mô tả, Trạng thái."
          columns={['Người nộp', 'Phòng', 'Hạng mục', 'Điểm', 'Ngày thực hiện', 'Mô tả', 'Trạng thái']}
          sampleRows={[
            [
              'Nguyễn An',
              'Phòng Kinh doanh 1',
              'Booking',
              4,
              '12/09/2026',
              'Dự án Lumi Hà Nội — booking #BK-3391',
              'Đã duyệt',
            ],
            [
              'Trần Bảo Khánh',
              'Phòng Kinh doanh 2',
              'Check-in sự kiện',
              1,
              '10/09/2026',
              'Nhóm 4 KH — Sự kiện Sun Grand City',
              'Chờ duyệt',
            ],
          ]}
          templateFilename="mau-nhap-minh-chung-dtr.csv"
          onCancel={() => setShowImportModal(false)}
          onImport={async (file) => {
            if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
              setImportMessage('Hãy lưu file thành CSV (Excel → Save As → CSV UTF-8) rồi nhập lại.')
              setShowImportModal(false)
              return
            }
            try {
              const text = await readFileAsText(file)
              const rows = parseCsvText(text)
              if (rows.length === 0) {
                setImportMessage('File trống.')
                setShowImportModal(false)
                return
              }
              const header = rows[0].join(' ').toLowerCase()
              const dataRows = /người|hạng|điểm/.test(header) ? rows.slice(1) : rows
              const inputs = dataRows
                .map((row) => ({
                  userName: (row[0] ?? '').trim(),
                  categoryLabel: (row[2] ?? '').trim() || 'Khác',
                  points: Number(String(row[3] ?? '0').replace(',', '.')) || 0,
                  date: (row[4] ?? '').trim() || new Date().toLocaleDateString('vi-VN'),
                  description: (row[5] ?? '').trim() || '—',
                  status: parseStatusLabel(row[6] ?? 'pending'),
                }))
                .filter((row) => row.userName)
              const added = addSubmissions(inputs)
              if (role) {
                logAudit({
                  actor: profile.name,
                  actorRole: role,
                  action: 'import_submissions',
                  target: file.name,
                  detail: `Thêm ${added} minh chứng`,
                })
              }
              setImportMessage(`Đã nhập ${added} minh chứng từ file.`)
            } catch {
              setImportMessage('Không đọc được file CSV.')
            }
            setShowImportModal(false)
          }}
        />
      )}
    </section>
  )
}
