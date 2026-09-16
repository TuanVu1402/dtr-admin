import { useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import type { AdminSubmission, SubmissionStatus } from '../../types/dtr'
import { formatPoints } from '../../utils/format'
import EvidenceModal from '../../components/EvidenceModal'
import HoverPreview from '../../components/HoverPreview'
import RejectReasonModal from '../../components/RejectReasonModal'
import ManualEntryForm from '../../components/ManualEntryForm'
import ImportExcelModal from '../../components/ImportExcelModal'
import { SearchIcon } from '../../components/icons'

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

function actionBtnClass(kind: 'approve' | 'reject', state: 'active' | 'muted' | '') {
  const base = "cursor-pointer rounded-lg border px-3 py-2 font-['Open_Sans',sans-serif] text-[12.5px] font-bold transition-[transform,background,box-shadow,opacity] duration-150"
  const tone =
    kind === 'approve'
      ? 'border-[rgba(76,175,130,0.4)] bg-[rgba(76,175,130,0.14)] text-(--positive)'
      : 'border-[rgba(217,122,108,0.4)] bg-[rgba(217,122,108,0.14)] text-(--negative)'
  const active =
    state === 'active'
      ? kind === 'approve'
        ? 'border-(--positive) bg-[rgba(76,175,130,0.3)] font-extrabold text-(--positive)'
        : 'border-(--negative) bg-[rgba(217,122,108,0.3)] font-extrabold text-(--negative)'
      : ''
  const muted = state === 'muted' ? 'opacity-40' : ''
  return `${base} ${tone} ${active} ${muted}`
}

export default function ManagerPanel() {
  const { submissions, users, setStatus, rejectSubmission, addSubmission } = useSubmissions()
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null)
  const [rejectingSubmission, setRejectingSubmission] = useState<AdminSubmission | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

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

  const filteredSubmissions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return submissions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (categoryFilter !== 'all' && s.categoryLabel !== categoryFilter) return false
      if (userFilter !== 'all' && s.userName !== userFilter) return false
      if (keyword) {
        const haystack = `${s.userName} ${s.categoryLabel} ${s.description}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      return true
    })
  }, [submissions, statusFilter, categoryFilter, userFilter, searchTerm])

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
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
        <div
          className={`${sRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}
        >
          <div>Người nộp</div>
          <div>Hạng mục</div>
          <div>Mô tả / minh chứng</div>
          <div>Ngày nộp</div>
          <div>Điểm</div>
          <div>Duyệt</div>
        </div>
        {filteredSubmissions.length === 0 && (
          <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Không có minh chứng nào khớp bộ lọc.</p>
        )}
        {filteredSubmissions.map((s) => {
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
          columns={['Người nộp', 'Hạng mục', 'Điểm', 'Ngày thực hiện', 'Mô tả', 'Trạng thái']}
          sampleRows={[
            ['Nguyễn An', 'Booking', 4, '12/09/2026', 'Dự án Lumi Hà Nội — booking #BK-3391', 'Đã duyệt'],
            [
              'Trần Bảo Khánh',
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
