import { useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { useFeedback } from '../../context/FeedbackContext'
import { DownloadIcon, TrendUpIcon } from '../../components/ui/icons'
import SearchableSelect from '../../components/form/SearchableSelect'
import { formatPoints, parseVNDate } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import { exportPdf } from '../../utils/exportPdf'
import type { SubmissionStatus } from '../../types/dtr'

type RangePreset = 'all' | 'month' | 'quarter' | 'custom'

const statusLabels: Record<SubmissionStatus, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
}

function lastSixMonths(now = new Date()) {
  const months: { key: string; label: string; year: number; month: number }[] = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `T${d.getMonth() + 1}`, year: d.getFullYear(), month: d.getMonth() })
  }
  return months
}

// Các bước chia trục thường gặp, chọn bước đầu tiên cho ra tối đa 4 vạch lưới.
const AXIS_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]

/**
 * Dựng trục dọc cho biểu đồ cột: chừa sẵn ~20% khoảng trống phía trên để nhãn số
 * nằm trên đầu cột không bị tràn ra khỏi vùng vẽ.
 */
function buildAxis(max: number) {
  const headroom = Math.max(max * 1.2, 1)
  const step = AXIS_STEPS.find((s) => headroom / s <= 4) ?? 1000
  const axisMax = Math.ceil(headroom / step) * step
  const ticks: number[] = []
  for (let value = axisMax; value >= 0; value -= step) ticks.push(value)
  return { axisMax, ticks }
}

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
  const [exportRoom, setExportRoom] = useState('all')
  const [exportCategory, setExportCategory] = useState('all')
  const [exportStatus, setExportStatus] = useState<SubmissionStatus | 'all'>('all')
  const [exportRange, setExportRange] = useState<RangePreset>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const submitterOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.userName))).sort(),
    [submissions],
  )
  const roomOptions = useMemo(
    () => Array.from(new Set(users.map((u) => u.room).filter((room): room is string => Boolean(room)))).sort(),
    [users],
  )
  const categoryOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.categoryLabel))).sort(),
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
      if (exportRoom !== 'all' && userByName.get(s.userName)?.room !== exportRoom) return false
      if (exportCategory !== 'all' && s.categoryLabel !== exportCategory) return false
      if (exportStatus !== 'all' && s.status !== exportStatus) return false
      if (rangeStart || rangeEnd) {
        const d = parseVNDate(s.date)
        if (rangeStart && d < rangeStart) return false
        if (rangeEnd && d > rangeEnd) return false
      }
      return true
    })
  }, [submissions, exportUser, exportRoom, exportCategory, exportStatus, exportRange, customFrom, customTo, userByName])

  const hasActiveFilters =
    exportUser !== 'all' || exportRoom !== 'all' || exportCategory !== 'all' || exportStatus !== 'all' || exportRange !== 'all'

  function resetExportFilters() {
    setExportUser('all')
    setExportRoom('all')
    setExportCategory('all')
    setExportStatus('all')
    setExportRange('all')
    setCustomFrom('')
    setCustomTo('')
  }

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

  const monthlyTrend = useMemo(() => {
    const buckets = lastSixMonths()
    return buckets.map((bucket) => {
      let count = 0
      let points = 0
      for (const s of submissions) {
        const d = parseVNDate(s.date)
        if (d.getFullYear() === bucket.year && d.getMonth() === bucket.month) {
          count += 1
          if (s.status === 'approved') points += s.points
        }
      }
      return { month: bucket.label, count, points }
    })
  }, [submissions])

  const trend = useMemo(() => {
    const counts = monthlyTrend.map((m) => m.count)
    const peakCount = Math.max(0, ...counts)
    const totalCount = counts.reduce((sum, c) => sum + c, 0)
    const latest = monthlyTrend[monthlyTrend.length - 1]
    const previous = monthlyTrend[monthlyTrend.length - 2]
    const deltaPercent =
      previous && previous.count > 0 ? Math.round(((latest.count - previous.count) / previous.count) * 100) : 0
    return {
      ...buildAxis(Math.max(peakCount, 1)),
      peakCount,
      totalCount,
      avgCount: monthlyTrend.length ? Math.round(totalCount / monthlyTrend.length) : 0,
      totalPoints: monthlyTrend.reduce((sum, m) => sum + m.points, 0),
      deltaPercent,
      latest,
    }
  }, [monthlyTrend])

  function handleExportPdf() {
    const rows = filteredForExport
      .map(
        (s) =>
          `<tr><td>${s.userName}</td><td>${userByName.get(s.userName)?.room ?? '—'}</td><td>${s.categoryLabel}</td><td>${s.date}</td><td>${formatPoints(s.points)}</td><td>${statusLabels[s.status]}</td></tr>`,
      )
      .join('')
    exportPdf(
      'Báo cáo DTR Point',
      `<table><thead><tr><th>Người nộp</th><th>Phòng</th><th>Hạng mục</th><th>Ngày</th><th>Điểm</th><th>Trạng thái</th></tr></thead><tbody>${rows}</tbody></table>`,
    )
  }

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
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-4 max-[640px]:pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] tracking-[0.5px] text-(--text-primary)">
            Thống kê &amp; báo cáo
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary) max-[640px]:hidden">
            Tổng quan hoạt động chấm điểm DTR — số liệu cập nhật theo dữ liệu hiện có.
          </p>
        </div>
      </div>

      <div className={reportCardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={reportCardTitleClass}>Bộ lọc xuất báo cáo Excel / PDF</div>
          {hasActiveFilters && (
            <button
              type="button"
              className="cursor-pointer border-none bg-none p-0 text-[12.5px] font-bold text-(--gold-bright) hover:underline"
              onClick={resetExportFilters}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
            <label className={fieldLabelClass} htmlFor="export-user">
              Người nộp
            </label>
            <SearchableSelect
              id="export-user"
              value={exportUser}
              onChange={setExportUser}
              placeholder="Nhập tên người nộp..."
              options={[
                { value: 'all', label: 'Tất cả người nộp' },
                ...submitterOptions.map((name) => ({ value: name, label: name })),
              ]}
            />
          </div>

          <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
            <label className={fieldLabelClass} htmlFor="export-room">
              Phòng
            </label>
            <SearchableSelect
              id="export-room"
              value={exportRoom}
              onChange={setExportRoom}
              placeholder="Nhập tên phòng..."
              options={[
                { value: 'all', label: 'Tất cả phòng' },
                ...roomOptions.map((room) => ({ value: room, label: room })),
              ]}
            />
          </div>

          <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
            <label className={fieldLabelClass} htmlFor="export-category">
              Hạng mục
            </label>
            <SearchableSelect
              id="export-category"
              value={exportCategory}
              onChange={setExportCategory}
              placeholder="Nhập tên hạng mục..."
              options={[
                { value: 'all', label: 'Tất cả hạng mục' },
                ...categoryOptions.map((label) => ({ value: label, label })),
              ]}
            />
          </div>

          <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
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

          <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
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
              <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
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
              <div className="flex min-w-[200px] flex-col gap-2 max-[640px]:min-w-full">
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary) disabled:cursor-not-allowed disabled:opacity-50"
              disabled={filteredForExport.length === 0}
              onClick={handleExportPdf}
            >
              <DownloadIcon size={15} /> Xuất PDF
            </button>
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
      </div>

      <div className="grid grid-cols-3 gap-4 max-[960px]:grid-cols-2 max-[640px]:gap-2">
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--gold-bright)">{stats.totalUsers}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tổng người dùng</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--text-primary)">
            {stats.totalSubmissions}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tổng minh chứng</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--gold-bright)">
            {formatPoints(stats.totalPoints)}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Điểm đã cộng</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--positive)">{stats.approvalRate}%</div>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={reportCardTitleClass}>
            <TrendUpIcon size={16} /> Xu hướng minh chứng theo tháng
          </div>
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-extrabold ${
              trend.deltaPercent >= 0
                ? 'bg-[rgba(20,108,62,0.12)] text-(--positive)'
                : 'bg-[rgba(185,28,28,0.12)] text-(--negative)'
            }`}
          >
            {trend.deltaPercent >= 0 ? '▲' : '▼'} {Math.abs(trend.deltaPercent)}% so với tháng trước
          </div>
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-2">
          <div className="flex items-baseline gap-1.5 text-[12.5px] text-(--text-tertiary)">
            <span className="font-['Open_Sans',sans-serif] text-[17px] font-extrabold text-(--text-primary)">
              {trend.totalCount}
            </span>
            minh chứng
          </div>
          <div className="flex items-baseline gap-1.5 text-[12.5px] text-(--text-tertiary)">
            <span className="font-['Open_Sans',sans-serif] text-[17px] font-extrabold text-(--gold-bright)">
              {formatPoints(trend.totalPoints)}
            </span>
            điểm
          </div>
          <div className="flex items-baseline gap-1.5 text-[12.5px] text-(--text-tertiary)">
            <span className="font-['Open_Sans',sans-serif] text-[17px] font-extrabold text-(--text-primary)">
              {trend.avgCount}
            </span>
            trung bình/tháng
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-[210px] flex-col justify-between pb-10 text-right text-[10.5px] font-bold text-(--text-muted)">
            {trend.ticks.map((tick) => (
              <span className="leading-none" key={tick}>
                {tick}
              </span>
            ))}
          </div>

          <div className="relative min-w-0 flex-1">
            {/* Lưới ngang nằm dưới cột, canh đúng vùng vẽ (trừ 40px chân nhãn tháng). */}
            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-10 flex flex-col justify-between">
              {trend.ticks.map((tick) => (
                <span
                  className={`h-px w-full ${tick === 0 ? 'bg-(--text-muted) opacity-40' : 'bg-(--hairline)'}`}
                  key={tick}
                />
              ))}
            </div>

            <div className="relative flex h-[210px] items-stretch gap-2.5 max-[640px]:gap-1.5">
              {monthlyTrend.map((m) => {
                const isPeak = m.count === trend.peakCount
                return (
                  <div className="group flex h-full min-w-0 flex-1 flex-col" key={m.month}>
                    <div className="flex flex-1 items-end px-1 max-[640px]:px-0">
                      <div
                        className={`relative w-full rounded-t-lg shadow-[0_4px_12px_var(--shadow)] transition-[filter] duration-200 group-hover:brightness-110 ${
                          isPeak
                            ? 'bg-[linear-gradient(180deg,var(--gold-bright),var(--gold-deep))] ring-2 ring-(--gold-bright) ring-offset-2 ring-offset-(--surface-tint)'
                            : 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--gold-bright)_55%,transparent),var(--gold-deep))]'
                        }`}
                        style={{ height: `${(m.count / trend.axisMax) * 100}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-['Open_Sans',sans-serif] text-[13px] font-extrabold text-(--text-primary)">
                          {m.count}
                        </span>
                      </div>
                    </div>

                    <div className="flex h-10 flex-col items-center justify-center gap-0.5 pt-1.5">
                      <span
                        className={`text-[11.5px] font-bold ${
                          isPeak ? 'text-(--gold-bright)' : 'text-(--text-tertiary)'
                        }`}
                      >
                        {m.month}
                      </span>
                      <span className="text-[10.5px] font-semibold text-(--text-muted)">{m.points}đ</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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
