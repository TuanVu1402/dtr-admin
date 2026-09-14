import { useMemo, useState } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import type { AdminSubmission, SubmissionStatus } from '../../types/dtr'
import { formatPoints } from '../../utils/format'
import StatusBadge from '../../components/StatusBadge'
import EvidenceModal from '../../components/EvidenceModal'
import ManualEntryForm from '../../components/ManualEntryForm'
import ImportExcelModal from '../../components/ImportExcelModal'
import { SearchIcon } from '../../components/icons'
import '../../styles/shared.css'
import './admin.css'

const statusFilters: { label: string; value: SubmissionStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
]

export default function ManagerPanel() {
  const { submissions, setStatus, addSubmission } = useSubmissions()
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const stats = useMemo(() => {
    return {
      pending: submissions.filter((s) => s.status === 'pending').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
    }
  }, [submissions])

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
    <section className="content-section">
      <div className="panel-head">
        <div>
          <div className="section-title">Chấm điểm minh chứng</div>
          <p className="section-caption">Xem minh chứng người dùng đã nộp và duyệt / từ chối để chấm điểm.</p>
        </div>
        <div className="panel-head-actions">
          <button type="button" className="btn-secondary" onClick={() => setShowImportModal(true)}>
            Nhập từ Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowManualForm(true)}>
            + Thêm minh chứng
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num gold-text">{stats.pending}</div>
          <div className="stat-label">Chờ duyệt</div>
        </div>
        <div className="stat-card">
          <div className="stat-num stat-approved">{stats.approved}</div>
          <div className="stat-label">Đã duyệt</div>
        </div>
        <div className="stat-card">
          <div className="stat-num stat-rejected">{stats.rejected}</div>
          <div className="stat-label">Từ chối</div>
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

      <div className="select-filter-row">
        <div className="field search-field">
          <label className="field-label" htmlFor="filter-search">
            Tìm kiếm
          </label>
          <div className="search-input-wrap">
            <SearchIcon size={16} />
            <input
              id="filter-search"
              className="field-input search-input"
              type="text"
              placeholder="Tìm theo người nộp, hạng mục, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="filter-category">
            Hạng mục
          </label>
          <select
            id="filter-category"
            className="field-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả hạng mục</option>
            {categoryOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="filter-user">
            Người nộp
          </label>
          <select
            id="filter-user"
            className="field-input"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">Tất cả người nộp</option>
            {userOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card">
        <div className="s-row s-head">
          <div>Người nộp</div>
          <div>Hạng mục</div>
          <div>Mô tả / minh chứng</div>
          <div>Ngày nộp</div>
          <div>Điểm</div>
          <div>Trạng thái</div>
          <div>Duyệt</div>
        </div>
        {filteredSubmissions.length === 0 && (
          <p className="section-caption" style={{ padding: '20px 24px' }}>
            Không có minh chứng nào khớp bộ lọc.
          </p>
        )}
        {filteredSubmissions.map((s) => (
          <div className="s-row s-body" key={s.id}>
            <div className="s-user">{s.userName}</div>
            <div className="s-cat">{s.categoryLabel}</div>
            <div className="s-desc">
              <button type="button" className="s-desc-btn" onClick={() => setSelectedSubmission(s)}>
                {s.description}
              </button>
              {s.link && (
                <>
                  {' '}
                  <a className="s-link" href={s.link} target="_blank" rel="noreferrer">
                    Xem link ↗
                  </a>
                </>
              )}
            </div>
            <div className="s-date">{s.date}</div>
            <div className="s-points">+{formatPoints(s.points)}</div>
            <div>
              <StatusBadge status={s.status} />
            </div>
            <div className="s-actions">
              <button
                type="button"
                className="action-btn approve"
                disabled={s.status === 'approved'}
                onClick={() => setStatus(s.id, 'approved')}
              >
                Duyệt
              </button>
              <button
                type="button"
                className="action-btn reject"
                disabled={s.status === 'rejected'}
                onClick={() => setStatus(s.id, 'rejected')}
              >
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSubmission && (
        <EvidenceModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
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
