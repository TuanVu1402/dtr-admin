import type { AdminSubmission } from '../types/dtr'
import { formatPoints } from '../utils/format'
import StatusBadge from './StatusBadge'
import '../styles/shared.css'
import './EvidenceModal.css'

type EvidenceModalProps = {
  submission: AdminSubmission
  onClose: () => void
}

export default function EvidenceModal({ submission, onClose }: EvidenceModalProps) {
  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="evidence-card" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <div>
            <div className="form-eyebrow">Chi tiết minh chứng</div>
            <div className="form-title">{submission.categoryLabel}</div>
          </div>
          <button type="button" className="form-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="evidence-meta">
          <div className="evidence-meta-item">
            <div className="evidence-meta-label">Người nộp</div>
            <div className="evidence-meta-value">{submission.userName}</div>
          </div>
          <div className="evidence-meta-item">
            <div className="evidence-meta-label">Ngày nộp</div>
            <div className="evidence-meta-value">{submission.date}</div>
          </div>
          <div className="evidence-meta-item">
            <div className="evidence-meta-label">Điểm</div>
            <div className="evidence-meta-value gold-text">+{formatPoints(submission.points)}</div>
          </div>
          <div className="evidence-meta-item">
            <div className="evidence-meta-label">Trạng thái</div>
            <StatusBadge status={submission.status} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Mô tả</label>
          <p className="evidence-desc">{submission.description}</p>
        </div>

        {submission.status === 'rejected' && submission.rejectReason && (
          <div className="field">
            <label className="field-label">Lý do từ chối</label>
            <p className="evidence-desc evidence-reject-reason">{submission.rejectReason}</p>
          </div>
        )}

        <div className="field">
          <label className="field-label">Minh chứng</label>
          {submission.link ? (
            <a className="evidence-link-box" href={submission.link} target="_blank" rel="noreferrer">
              Mở link minh chứng ↗
            </a>
          ) : submission.imageDataUrl ? (
            <img className="evidence-photo" src={submission.imageDataUrl} alt="Ảnh minh chứng" />
          ) : (
            <div className="evidence-photo-placeholder">
              <span>🖼️ Ảnh minh chứng</span>
              <span className="evidence-photo-note">(bản demo chưa lưu ảnh thật)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
