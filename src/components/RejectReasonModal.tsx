import { useState, type FormEvent } from 'react'
import type { AdminSubmission } from '../types/dtr'
import '../styles/shared.css'

type RejectReasonModalProps = {
  submission: AdminSubmission
  onCancel: () => void
  onConfirm: (reason: string) => void
}

export default function RejectReasonModal({ submission, onCancel, onConfirm }: RejectReasonModalProps) {
  const [reason, setReason] = useState(submission.rejectReason ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Vui lòng nhập lý do từ chối.')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <div className="form-overlay" onClick={onCancel}>
      <form className="form-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <div className="form-eyebrow">Từ chối minh chứng</div>
            <div className="form-title">
              {submission.userName} — {submission.categoryLabel}
            </div>
          </div>
          <button type="button" className="form-close" onClick={onCancel} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="reject-reason">
            Lý do từ chối <span className="required-mark">*</span>
          </label>
          <textarea
            id="reject-reason"
            className={`field-input field-textarea${error ? ' has-error' : ''}`}
            placeholder="Ví dụ: Ảnh minh chứng không rõ, thiếu Timemark, sai hạng mục..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            autoFocus
          />
          {error && <div className="field-error">{error}</div>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="btn-primary">
            Xác nhận từ chối
          </button>
        </div>
      </form>
    </div>
  )
}
