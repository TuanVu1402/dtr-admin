import type { AdminSubmission } from '../types/dtr'
import { formatPoints } from '../utils/format'
import StatusBadge from './StatusBadge'

type EvidenceModalProps = {
  submission: AdminSubmission
  onClose: () => void
}

export default function EvidenceModal({ submission, onClose }: EvidenceModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[480px] max-h-[90svh] flex-col gap-5 overflow-y-auto rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">Chi tiết minh chứng</div>
            <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
              {submission.categoryLabel}
            </div>
          </div>
          <button
            type="button"
            className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3.5 max-[480px]:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Người nộp</div>
            <div className="text-[13.5px] font-bold text-(--text-primary)">{submission.userName}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Ngày nộp</div>
            <div className="text-[13.5px] font-bold text-(--text-primary)">{submission.date}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Điểm</div>
            <div className="text-[13.5px] font-bold text-(--gold-bright)">+{formatPoints(submission.points)}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Trạng thái</div>
            <StatusBadge status={submission.status} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-bold text-(--text-secondary)">Mô tả</label>
          <p className="m-0 text-sm leading-[1.6] text-(--text-secondary)">{submission.description}</p>
        </div>

        {submission.status === 'rejected' && submission.rejectReason && (
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-bold text-(--text-secondary)">Lý do từ chối</label>
            <p className="m-0 rounded-[10px] border border-[rgba(217,122,108,0.35)] bg-[rgba(217,122,108,0.1)] px-3.5 py-3 text-sm leading-[1.6] text-(--negative)">
              {submission.rejectReason}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-bold text-(--text-secondary)">Minh chứng</label>
          {submission.link ? (
            <a
              className="flex flex-col items-center justify-center gap-1 rounded-[10px] border border-[rgba(37,99,235,0.4)] bg-[rgba(37,99,235,0.1)] p-6.5 text-center text-sm font-bold text-(--gold-bright)"
              href={submission.link}
              target="_blank"
              rel="noreferrer"
            >
              Mở link minh chứng ↗
            </a>
          ) : submission.imageDataUrl ? (
            <img
              className="block max-h-[360px] w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] object-cover"
              src={submission.imageDataUrl}
              alt="Ảnh minh chứng"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-[rgba(37,99,235,0.3)] p-6.5 text-center text-sm text-(--text-tertiary)">
              <span>🖼️ Ảnh minh chứng</span>
              <span className="text-xs text-(--text-muted)">(bản demo chưa lưu ảnh thật)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
