import { useState, type FormEvent } from 'react'
import type { AdminSubmission } from '../../types/dtr'

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px] max-[640px]:items-end max-[640px]:p-0"
      onClick={onCancel}
    >
      <form
        className="flex w-full max-w-[480px] max-h-[90svh] flex-col gap-5 overflow-y-auto rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)] max-[640px]:max-h-[92svh] max-[640px]:rounded-b-none max-[640px]:p-5 max-[640px]:pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">Từ chối minh chứng</div>
            <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
              {submission.userName} — {submission.categoryLabel}
            </div>
          </div>
          <button
            type="button"
            className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
            onClick={onCancel}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-bold text-(--text-secondary)" htmlFor="reject-reason">
            Lý do từ chối <span>*</span>
          </label>
          <textarea
            id="reject-reason"
            className="min-h-[88px] w-full resize-y rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
            placeholder="Ví dụ: Ảnh minh chứng không rõ, thiếu Timemark, sai hạng mục..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            autoFocus
          />
          {error && <div>{error}</div>}
        </div>

        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
          >
            Xác nhận từ chối
          </button>
        </div>
      </form>
    </div>
  )
}
