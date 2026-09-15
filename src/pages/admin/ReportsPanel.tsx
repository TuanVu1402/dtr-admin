import { useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { useFeedback } from '../../context/FeedbackContext'
import { DownloadIcon, TrendUpIcon } from '../../components/icons'
import { formatPoints, parseVNDate } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import type { SubmissionStatus } from '../../types/dtr'
import '../../styles/shared.css'
import './admin.css'
import './ReportsPanel.css'

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
      ['Người nộp', 'Hạng mục', 'Mô tả', 'Ngày nộp', 'Điểm', 'Trạng thái'],
      filteredForExport.map((s) => [
        s.userName,
        s.categoryLabel,
        s.description,
        s.date,
        formatPoints(s.points),
        statusLabels[s.status],
      ]),
    )
  }

  return (
    <section className="content-section reports-section">
      <div className="panel-head">
        <div>
          <div className="section-title">Thống kê &amp; báo cáo</div>
          <p className="section-caption">Tổng quan hoạt động chấm điểm DTR — số liệu cập nhật theo dữ liệu hiện có.</p>
        </div>
      </div>

      <div className="report-card">
        <div className="report-card-title">Bộ lọc xuất báo cáo Excel</div>
        <div className="select-filter-row">
          <div className="field">
            <label className="field-label" htmlFor="export-user">
              Người nộp
            </label>
            <select
              id="export-user"
              className="field-input"
              value={exportUser}
              onChange={(e) => setExportUser(e.target.value)}
            >
              <option value="all">Tất cả người nộp</option>
              {submitterOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="export-status">
              Trạng thái
            </label>
            <select
              id="export-status"
              className="field-input"
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value as SubmissionStatus | 'all')}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="export-range">
              Khoảng thời gian
            </label>
            <select
              id="export-range"
              className="field-input"
              value={exportRange}
              onChange={(e) => setExportRange(e.target.value as RangePreset)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="custom">Tùy chỉnh...</option>
            </select>
          </div>

          {exportRange === 'custom' && (
            <>
              <div className="field">
                <label className="field-label" htmlFor="export-from">
                  Từ ngày
                </label>
                <input
                  id="export-from"
                  type="date"
                  className="field-input"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="export-to">
                  Đến ngày
                </label>
                <input
                  id="export-to"
                  type="date"
                  className="field-input"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="reports-export-footer">
          <p className="section-caption">Khớp {filteredForExport.length} minh chứng theo bộ lọc hiện tại.</p>
          <button
            type="button"
            className="btn-primary report-export-btn"
            disabled={filteredForExport.length === 0}
            onClick={handleExportCsv}
          >
            <DownloadIcon size={15} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="stats-row reports-stats-row">
        <div className="stat-card">
          <div className="stat-num gold-text">{stats.totalUsers}</div>
          <div className="stat-label">Tổng người dùng</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: 'var(--text-primary)' }}>
            {stats.totalSubmissions}
          </div>
          <div className="stat-label">Tổng minh chứng</div>
        </div>
        <div className="stat-card">
          <div className="stat-num gold-text">{formatPoints(stats.totalPoints)}</div>
          <div className="stat-label">Điểm đã cộng</div>
        </div>
        <div className="stat-card">
          <div className="stat-num stat-approved">{stats.approvalRate}%</div>
          <div className="stat-label">Tỷ lệ duyệt</div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-card-title">Minh chứng theo hạng mục</div>
          <div className="report-bar-list">
            {categoryBreakdown.length === 0 && <p className="section-caption">Chưa có dữ liệu.</p>}
            {categoryBreakdown.map((item) => (
              <div className="report-bar-row" key={item.label}>
                <div className="report-bar-label">{item.label}</div>
                <div className="report-bar-track">
                  <div className="report-bar-fill" style={{ width: `${item.percent}%` }} />
                </div>
                <div className="report-bar-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-title">Top người điểm cao</div>
          <div className="report-top-list">
            {topPerformers.length === 0 && <p className="section-caption">Chưa có dữ liệu.</p>}
            {topPerformers.map((entry, index) => (
              <div className="report-top-row" key={entry.name}>
                <span className="report-top-rank">{index + 1}</span>
                <span className="report-top-name">{entry.name}</span>
                <span className="report-top-points">{formatPoints(entry.points)} điểm</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="report-card">
        <div className="report-card-title">
          <TrendUpIcon size={16} /> Xu hướng minh chứng theo tháng
        </div>
        <div className="report-trend-chart">
          {monthlyTrend.map((m) => (
            <div className="report-trend-col" key={m.month}>
              <div className="report-trend-bar-wrap">
                <div
                  className="report-trend-bar"
                  style={{ height: `${Math.round((m.count / maxMonthly) * 100)}%` }}
                  title={`${m.count} minh chứng · ${m.points} điểm`}
                />
              </div>
              <div className="report-trend-label">{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="report-card">
        <div className="report-card-title">Hoạt động gần đây</div>
        <div className="report-activity-list">
          {recentActivity.length === 0 && <p className="section-caption">Chưa có hoạt động nào.</p>}
          {recentActivity.map((s) => (
            <div className="report-activity-row" key={s.id}>
              <span className={`report-activity-dot dot-${s.status}`} />
              <div className="report-activity-body">
                <span className="report-activity-user">{s.userName}</span> nộp{' '}
                <span className="report-activity-cat">{s.categoryLabel}</span> — {s.description}
              </div>
              <div className="report-activity-date">{s.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="report-card">
        <div className="report-card-title">Phản hồi người dùng</div>
        <div className="reports-feedback-row">
          <div className="reports-feedback-item">
            <span className="report-top-points">{feedbackList.length}</span> tổng phản hồi
          </div>
          <div className="reports-feedback-item">
            <span className="report-top-points">{feedbackList.filter((f) => f.status === 'new').length}</span>{' '}
            chưa xử lý
          </div>
          <div className="reports-feedback-item">
            <span className="report-top-points">
              {feedbackList.filter((f) => f.status === 'resolved').length}
            </span>{' '}
            đã xử lý
          </div>
        </div>
      </div>
    </section>
  )
}
