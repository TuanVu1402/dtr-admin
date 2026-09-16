type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Hộp thoại xác nhận dùng chung cho các thao tác cần double-check, ví dụ xoá người dùng. */
export default function ConfirmDialog({ title, message, confirmLabel, danger, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-[420px] flex-col gap-5 rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">{title}</div>
          <p className="m-0 mt-2 text-sm leading-[1.6] text-(--text-secondary)">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            className={
              danger
                ? "min-h-11 cursor-pointer rounded-[10px] border-none bg-(--negative) px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-white"
                : "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
            }
            onClick={onConfirm}
          >
            {confirmLabel ?? 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}
