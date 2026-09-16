import { useEffect, useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import type { AdminSubmission, SubmissionStatus } from '../../types/dtr'
import { formatPoints, parseVNDate } from '../../utils/format'
import EvidenceModal from '../../components/EvidenceModal'
import HoverPreview from '../../components/HoverPreview'
import RejectReasonModal from '../../components/RejectReasonModal'
import ManualEntryForm from '../../components/ManualEntryForm'
import ImportExcelModal from '../../components/ImportExcelModal'
import { SearchIcon } from '../../components/icons'
import SortableHeaderCell, { compareValues, nextSortState, type SortDir } from '../../components/SortableHeaderCell'

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

const SUBMISSIONS_PAGE_SIZE = 20
const SUBMISSIONS_PAGE_STEP = 10

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
  const { submissions, users, setStatus, rejectSubmission, addSubmission } = useSubmissions()
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [roomFilter, setRoomFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null)
  const [rejectingSubmission, setRejectingSubmission] = useState<AdminSubmission | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(SUBMISSIONS_PAGE_SIZE)
  const [sortKey, setSortKey] = useState<SubmissionSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const stats = useMemo(() => {
    return {
      pending: submissions.filter((s) => s.status === 'pending').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
    }
  }, [submissions])

  const userByName = useMemo(() => new Map(users.map((u) => [u.name, u])), [users])

  const categoryOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.categoryLabel))).sort(),
    [submissions],
  )
  const userOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.userName))).sort(),
    [submissions],
  )
  const roomOptions = useMemo(
    () => Array.from(new Set(users.map((u) => u.room).filter((room): room is string => Boolean(room)))).sort(),
    [users],
  )

  const filteredSubmissions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return submissions.filter((s) => {
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
  }, [submissions, statusFilter, categoryFilter, userFilter, roomFilter, searchTerm, userByName])

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

  const visibleSubmissions = sortedSubmissions.slice(0, visibleCount)

  function handleSort(key: SubmissionSortKey) {
    const next = nextSortState(sortKey, sortDir, key)
    setSortKey(next.key)
    setSortDir(next.dir)
  }

  useEffect(() => {
    setVisibleCount(SUBMISSIONS_PAGE_SIZE)
  }, [statusFilter, categoryFilter, userFilter, roomFilter, searchTerm])

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
            Chấm điểm minh chứng
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Xem minh chứng người dùng đã nộp và duyệt / từ chối để chấm điểm.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnSecondaryClass} onClick={() => setShowImportModal(true)}>
            Nhập từ Excel
          </button>
          <button type="button" className={btnPrimaryClass} onClick={() => setShowManualForm(true)}>
            + Thêm minh chứng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--gold-bright)">{stats.pending}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Chờ duyệt</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--positive)">{stats.approved}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Đã duyệt</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--negative)">{stats.rejected}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Từ chối</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`cursor-pointer rounded-full border px-4.5 py-2.5 font-inherit text-[13px] font-bold ${
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
        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
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
        <div className="flex min-w-[200px] flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="filter-category">
            Hạng mục
          </label>
          <select
            id="filter-category"
            className={`cursor-pointer ${fieldInputClass}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all" className="bg-[#fdf8ec] text-[#0d1f3d]">
              Tất cả hạng mục
            </option>
            {categoryOptions.map((label) => (
              <option key={label} value={label} className="bg-[#fdf8ec] text-[#0d1f3d]">
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[200px] flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="filter-user">
            Người nộp
          </label>
          <select
            id="filter-user"
            className={`cursor-pointer ${fieldInputClass}`}
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all" className="bg-[#fdf8ec] text-[#0d1f3d]">
              Tất cả người nộp
            </option>
            {userOptions.map((name) => (
              <option key={name} value={name} className="bg-[#fdf8ec] text-[#0d1f3d]">
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-[200px] flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="filter-room">
            Phòng
          </label>
          <select
            id="filter-room"
            className={`cursor-pointer ${fieldInputClass}`}
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="all" className="bg-[#fdf8ec] text-[#0d1f3d]">
              Tất cả phòng
            </option>
            {roomOptions.map((room) => (
              <option key={room} value={room} className="bg-[#fdf8ec] text-[#0d1f3d]">
                {room}
              </option>
            ))}
          </select>
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
              <HoverPreview
                text={userTooltip}
                className="inline-block w-fit cursor-help text-sm font-bold text-(--text-primary) underline decoration-[rgba(37,99,235,0.4)] decoration-dotted underline-offset-[3px]"
              >
                {s.userName}
              </HoverPreview>
              <div className="text-[13.5px] font-semibold text-(--gold-bright)">{s.categoryLabel}</div>
              <div className="text-[13.5px] text-(--text-tertiary)">
                {s.imageDataUrl ? (
                  <HoverPreview imageUrl={s.imageDataUrl}>
                    <button
                      type="button"
                      className="cursor-pointer border-none bg-none p-0 text-left font-inherit text-[13.5px] text-(--text-tertiary) underline decoration-dotted underline-offset-[3px] hover:text-(--gold-bright)"
                      aria-label="Hover để xem ảnh minh chứng"
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
                  onClick={() => setStatus(s.id, 'approved')}
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
        <div className="flex items-center justify-center gap-2.5">
          <span className="text-[12.5px] text-(--text-tertiary)">
            Hiện {visibleSubmissions.length}/{filteredSubmissions.length} minh chứng
          </span>
          {visibleCount < filteredSubmissions.length && (
            <button
              type="button"
              className="cursor-pointer rounded-full border border-[rgba(37,99,235,0.28)] bg-transparent px-4 py-[7px] font-inherit text-[12.5px] font-bold text-(--gold-bright) transition-[background,border-color] duration-150 hover:border-[rgba(37,99,235,0.45)] hover:bg-[rgba(37,99,235,0.08)]"
              onClick={() => setVisibleCount((v) => Math.min(v + SUBMISSIONS_PAGE_STEP, filteredSubmissions.length))}
            >
              Xem thêm
            </button>
          )}
          {visibleCount > SUBMISSIONS_PAGE_SIZE && (
            <button
              type="button"
              className="cursor-pointer rounded-full border border-(--hairline) bg-transparent px-4 py-[7px] font-inherit text-[12.5px] font-bold text-(--text-tertiary) transition-[background,border-color] duration-150 hover:border-(--text-tertiary) hover:bg-(--surface-tint)"
              onClick={() => setVisibleCount(SUBMISSIONS_PAGE_SIZE)}
            >
              Thu gọn
            </button>
          )}
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
          description="Tải lên file danh sách minh chứng để chấm điểm hàng loạt thay vì nhập tay từng dòng."
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
          onImport={() => {
            // TODO: đọc và parse file Excel thành danh sách minh chứng khi có thư viện xử lý file ở backend/BE.
            setShowImportModal(false)
          }}
        />
      )}
    </section>
  )
}
