import { useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { useFeedback } from '../../context/FeedbackContext'
import { DownloadIcon, TrendUpIcon } from '../../components/icons'
import { formatPoints, parseVNDate } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import type { SubmissionStatus } from '../../types/dtr'

type RangePreset = 'all' | 'month' | 'quarter' | 'custom'

const statusLabels: Record<SubmissionStatus, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
}

// Số liệu xu hướng theo tháng — minh hoạ, chưa có dữ liệu lịch sử thật để tổng hợp.
const monthlyTrend = [
  { month: 'T4', count: 14, points: 42 },
  { month: 'T5', count: 18, points: 55 },
  { month: 'T6', count: 21, points: 63 },
  { month: 'T7', count: 19, points: 58 },
  { month: 'T8', count: 24, points: 71 },
  { month: 'T9', count: 12, points: 39 },
]

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'
const reportCardClass =
  'flex flex-col gap-4 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-6 py-5.5'
const reportCardTitleClass = "flex items-center gap-2 font-['Open_Sans',sans-serif] text-[15px] font-extrabold text-(--text-primary)"
const dotClass: Record<SubmissionStatus, string> = {
  approved: 'bg-(--positive)',
  pending: 'bg-(--gold-bright)',
  rejected: 'bg-(--negative)',
}

export default function ReportsPanel() {
  const { submissions, users } = useSubmissions()
  const { feedbackList } = useFeedback()

  const [exportUser, setExportUser] = useState('all')
  const [exportStatus, setExportStatus] = useState<SubmissionStatus | 'all'>('all')
  const [exportRange, setExportRange] = useState<RangePreset>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const submitterOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.userName))).sort(),
    [submissions],
  )

  const userByName = useMemo(() => new Map(users.map((u) => [u.name, u])), [users])

  const filteredForExport = useMemo(() => {
    const now = new Date()
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null

    if (exportRange === 'month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    } else if (exportRange === 'quarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      rangeStart = new Date(now.getFullYear(), quarterStartMonth, 1)
      rangeEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59)
    } else if (exportRange === 'custom') {
      rangeStart = customFrom ? new Date(customFrom) : null
      rangeEnd = customTo ? new Date(`${customTo}T23:59:59`) : null
    }

    return submissions.filter((s) => {
      if (exportUser !== 'all' && s.userName !== exportUser) return false
      if (exportStatus !== 'all' && s.status !== exportStatus) return false
      if (rangeStart || rangeEnd) {
        const d = parseVNDate(s.date)
        if (rangeStart && d < rangeStart) return false
        if (rangeEnd && d > rangeEnd) return false
      }
      return true
    })
  }, [submissions, exportUser, exportStatus, exportRange, customFrom, customTo])

  const stats = useMemo(() => {
    const approved = submissions.filter((s) => s.status === 'approved')
    const pending = submissions.filter((s) => s.status === 'pending')
    const rejected = submissions.filter((s) => s.status === 'rejected')
    const decided = approved.length + rejected.length
    return {
      totalUsers: users.filter((u) => u.role === 'user').length,
      totalSubmissions: submissions.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      approvalRate: decided > 0 ? Math.round((approved.length / decided) * 100) : 0,
      totalPoints: approved.reduce((sum, s) => sum + s.points, 0),
    }
  }, [submissions, users])

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of submissions) {
      map.set(s.categoryLabel, (map.get(s.categoryLabel) ?? 0) + 1)
    }
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
    const max = entries.length > 0 ? entries[0][1] : 1
    return entries.map(([label, count]) => ({ label, count, percent: Math.round((count / max) * 100) }))
  }, [submissions])

  const topPerformers = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of submissions) {
      if (s.status !== 'approved') continue
      map.set(s.userName, (map.get(s.userName) ?? 0) + s.points)
    }
    return Array.from(map.entries())
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
  }, [submissions])

  const recentActivity = useMemo(() => {
    return [...submissions]
      .sort((a, b) => parseVNDate(b.date).getTime() - parseVNDate(a.date).getTime())
      .slice(0, 6)
  }, [submissions])

  const maxMonthly = Math.max(...monthlyTrend.map((m) => m.count))

  function handleExportCsv() {
    const nameSlug = exportUser === 'all' ? 'tat-ca' : exportUser.toLowerCase().replace(/\s+/g, '-')
    exportCsv(
      `bao-cao-dtr-${nameSlug}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Người nộp', 'Phòng', 'Hạng mục', 'Mô tả', 'Ngày nộp', 'Điểm', 'Trạng thái'],
      filteredForExport.map((s) => [
        s.userName,
        userByName.get(s.userName)?.room ?? '—',
        s.categoryLabel,
        s.description,
        s.date,
        formatPoints(s.points),
        statusLabels[s.status],
      ]),
    )
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
            Thống kê &amp; báo cáo
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Tổng quan hoạt động chấm điểm DTR — số liệu cập nhật theo dữ liệu hiện có.
          </p>
        </div>
      </div>

      <div className={reportCardClass}>
        <div className={reportCardTitleClass}>Bộ lọc xuất báo cáo Excel</div>
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[200px] flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="export-user">
              Người nộp
            </label>
            <select
              id="export-user"
              className={`cursor-pointer ${fieldInputClass}`}
              value={exportUser}
              onChange={(e) => setExportUser(e.target.value)}
            >
              <option value="all" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Tất cả người nộp
              </option>
              {submitterOptions.map((name) => (
                <option key={name} value={name} className="bg-[#fdf8ec] text-[#0d1f3d]">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-[200px] flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="export-status">
              Trạng thái
            </label>
            <select
              id="export-status"
              className={`cursor-pointer ${fieldInputClass}`}
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value as SubmissionStatus | 'all')}
            >
              <option value="all" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Tất cả trạng thái
              </option>
              <option value="pending" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Chờ duyệt
              </option>
              <option value="approved" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Đã duyệt
              </option>
              <option value="rejected" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Từ chối
              </option>
            </select>
          </div>

          <div className="flex min-w-[200px] flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="export-range">
              Khoảng thời gian
            </label>
            <select
              id="export-range"
              className={`cursor-pointer ${fieldInputClass}`}
              value={exportRange}
              onChange={(e) => setExportRange(e.target.value as RangePreset)}
            >
              <option value="all" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Tất cả thời gian
              </option>
              <option value="month" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Tháng này
              </option>
              <option value="quarter" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Quý này
              </option>
              <option value="custom" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Tùy chỉnh...
              </option>
            </select>
          </div>

          {exportRange === 'custom' && (
            <>
              <div className="flex min-w-[200px] flex-col gap-2">
                <label className={fieldLabelClass} htmlFor="export-from">
                  Từ ngày
                </label>
                <input
                  id="export-from"
                  type="date"
                  className={fieldInputClass}
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="flex min-w-[200px] flex-col gap-2">
                <label className={fieldLabelClass} htmlFor="export-to">
                  Đến ngày
                </label>
                <input
                  id="export-to"
                  type="date"
                  className={fieldInputClass}
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Khớp {filteredForExport.length} minh chứng theo bộ lọc hiện tại.
          </p>
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold) disabled:cursor-not-allowed disabled:opacity-50"
            disabled={filteredForExport.length === 0}
            onClick={handleExportCsv}
          >
            <DownloadIcon size={15} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--gold-bright)">{stats.totalUsers}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tổng người dùng</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--text-primary)">
            {stats.totalSubmissions}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tổng minh chứng</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--gold-bright)">
            {formatPoints(stats.totalPoints)}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Điểm đã cộng</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--positive)">{stats.approvalRate}%</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tỷ lệ duyệt</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4.5 max-[960px]:grid-cols-1">
        <div className={reportCardClass}>
          <div className={reportCardTitleClass}>Minh chứng theo hạng mục</div>
          <div className="flex flex-col gap-3">
            {categoryBreakdown.length === 0 && (
              <p className="m-0 text-sm font-medium text-(--text-tertiary)">Chưa có dữ liệu.</p>
            )}
            {categoryBreakdown.map((item) => (
              <div
                className="grid grid-cols-[140px_1fr_30px] items-center gap-2.5 max-[960px]:grid-cols-[100px_1fr_26px]"
                key={item.label}
              >
                <div className="overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap text-(--text-secondary)">
                  {item.label}
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-(--hairline)">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))]"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="text-right text-[12.5px] font-bold text-(--text-primary)">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={reportCardClass}>
          <div className={reportCardTitleClass}>Top người điểm cao</div>
          <div className="flex flex-col gap-2.5">
            {topPerformers.length === 0 && (
              <p className="m-0 text-sm font-medium text-(--text-tertiary)">Chưa có dữ liệu.</p>
            )}
            {topPerformers.map((entry, index) => (
              <div
                className="flex items-center gap-3 border-b border-(--hairline) py-2 last:border-b-0"
                key={entry.name}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(37,99,235,0.14)] text-xs font-extrabold text-(--gold-bright)">
                  {index + 1}
                </span>
                <span className="flex-1 text-[13.5px] font-bold text-(--text-primary)">{entry.name}</span>
                <span className="font-['Open_Sans',sans-serif] text-[13px] font-extrabold text-(--gold-bright)">
                  {formatPoints(entry.points)} điểm
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={reportCardClass}>
        <div className={reportCardTitleClass}>
          <TrendUpIcon size={16} /> Xu hướng minh chứng theo tháng
        </div>
        <div className="flex h-[160px] items-end gap-4 pt-2.5">
          {monthlyTrend.map((m) => (
            <div className="flex h-full flex-1 flex-col items-center gap-2" key={m.month}>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full min-h-1 rounded-t-md bg-[linear-gradient(180deg,var(--gold-bright),var(--gold-deep))]"
                  style={{ height: `${Math.round((m.count / maxMonthly) * 100)}%` }}
                  title={`${m.count} minh chứng · ${m.points} điểm`}
                />
              </div>
              <div className="text-[11.5px] font-bold text-(--text-tertiary)">{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={reportCardClass}>
        <div className={reportCardTitleClass}>Hoạt động gần đây</div>
        <div className="flex flex-col">
          {recentActivity.length === 0 && (
            <p className="m-0 text-sm font-medium text-(--text-tertiary)">Chưa có hoạt động nào.</p>
          )}
          {recentActivity.map((s) => (
            <div
              className="flex items-center gap-3 border-b border-(--hairline) py-2.5 text-[13px] last:border-b-0"
              key={s.id}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass[s.status]}`} />
              <div className="flex-1 text-(--text-secondary)">
                <span className="font-bold text-(--text-primary)">{s.userName}</span> nộp{' '}
                <span className="font-semibold text-(--gold-bright)">{s.categoryLabel}</span> — {s.description}
              </div>
              <div className="text-xs whitespace-nowrap text-(--text-muted)">{s.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={reportCardClass}>
        <div className={reportCardTitleClass}>Phản hồi người dùng</div>
        <div className="flex flex-wrap gap-7">
          <div className="flex items-baseline gap-1.5 text-[13.5px] text-(--text-secondary)">
            <span className="font-['Open_Sans',sans-serif] text-[13px] font-extrabold text-(--gold-bright)">
              {feedbackList.length}
            </span>{' '}
            tổng phản hồi
          </div>
          <div className="flex items-baseline gap-1.5 text-[13.5px] text-(--text-secondary)">
            <span className="font-['Open_Sans',sans-serif] text-[13px] font-extrabold text-(--gold-bright)">
              {feedbackList.filter((f) => f.status === 'new').length}
            </span>{' '}
            chưa xử lý
          </div>
          <div className="flex items-baseline gap-1.5 text-[13.5px] text-(--text-secondary)">
            <span className="font-['Open_Sans',sans-serif] text-[13px] font-extrabold text-(--gold-bright)">
              {feedbackList.filter((f) => f.status === 'resolved').length}
            </span>{' '}
            đã xử lý
          </div>
        </div>
      </div>
    </section>
  )
}
