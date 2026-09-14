import { useMemo, useState } from 'react'
import { useFeedback } from '../../context/FeedbackContext'
import { feedbackTypeLabels, type FeedbackStatus } from '../../types/dtr'
import '../../styles/shared.css'
import './admin.css'

const statusFilters: { label: string; value: FeedbackStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa xử lý', value: 'new' },
  { label: 'Đã xử lý', value: 'resolved' },
]

export default function FeedbackPanel() {
  const { feedbackList, setFeedbackStatus } = useFeedback()
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all')

  const stats = useMemo(() => {
    return {
      total: feedbackList.length,
      new: feedbackList.filter((f) => f.status === 'new').length,
      resolved: feedbackList.filter((f) => f.status === 'resolved').length,
    }
  }, [feedbackList])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return feedbackList
    return feedbackList.filter((f) => f.status === statusFilter)
  }, [feedbackList, statusFilter])

  return (
    <section className="content-section">
      <div className="section-title">Phản hồi từ người dùng</div>
      <p className="section-caption">Báo lỗi và góp ý người dùng gửi từ Trang chủ User.</p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num gold-text">{stats.new}</div>
          <div className="stat-label">Chưa xử lý</div>
        </div>
        <div className="stat-card">
          <div className="stat-num stat-approved">{stats.resolved}</div>
          <div className="stat-label">Đã xử lý</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: 'var(--text-primary)' }}>
            {stats.total}
          </div>
          <div className="stat-label">Tổng số</div>
        </div>
      </div>

      <div className="filter-row">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`filter-chip${filter.value === statusFilter ? ' active' : ''}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="f-row f-head">
          <div>Loại</div>
          <div>Nội dung</div>
          <div>Email</div>
          <div>Thời gian gửi</div>
          <div>Trạng thái</div>
          <div>Xử lý</div>
        </div>
        {filtered.length === 0 && (
          <p className="section-caption" style={{ padding: '20px 24px' }}>
            Chưa có phản hồi nào.
          </p>
        )}
        {filtered.map((f) => (
          <div className="f-row f-body" key={f.id}>
            <div className="f-type">{feedbackTypeLabels[f.type]}</div>
            <div className="f-content">{f.content}</div>
            <div className="f-email">{f.email ?? '—'}</div>
            <div className="f-date">{f.createdAt}</div>
            <div>
              <span className={`badge ${f.status === 'resolved' ? 'badge-approved' : 'badge-pending'}`}>
                {f.status === 'resolved' ? 'Đã xử lý' : 'Chưa xử lý'}
              </span>
            </div>
            <div>
              <button
                type="button"
                className={`action-btn ${f.status === 'resolved' ? 'reject' : 'approve'}`}
                onClick={() => setFeedbackStatus(f.id, f.status === 'resolved' ? 'new' : 'resolved')}
              >
                {f.status === 'resolved' ? 'Mở lại' : 'Đánh dấu đã xử lý'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
