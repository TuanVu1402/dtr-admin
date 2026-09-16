import { roleLabels, type AdminSubmission, type AdminUser } from '../../types/dtr'
import { formatPoints } from '../../utils/format'
import UserAvatar from '../ui/UserAvatar'
import StatusBadge from '../ui/StatusBadge'

type UserDetailModalProps = {
  user: AdminUser
  submissions: AdminSubmission[]
  totalPoints: number
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

const roleChipClass: Record<AdminUser['role'], string> = {
  user: 'bg-[rgba(159,176,201,0.14)] text-(--text-secondary) border-[rgba(159,176,201,0.35)]',
  admin: 'bg-[rgba(37,99,235,0.12)] text-(--gold-bright) border-[rgba(37,99,235,0.4)]',
  manager: 'bg-[rgba(76,175,130,0.14)] text-(--positive) border-[rgba(76,175,130,0.4)]',
  support_admin: 'bg-[rgba(217,122,108,0.14)] text-(--negative) border-[rgba(217,122,108,0.4)]',
}

/** Xem đầy đủ thông tin của một người dùng — mở khi bấm vào tên/dòng trong bảng. */
export default function UserDetailModal({ user, submissions, totalPoints, onClose, onEdit, onDelete }: UserDetailModalProps) {
  const recent = submissions.slice(0, 6)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[520px] max-h-[90svh] flex-col gap-5 overflow-y-auto rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-base font-bold text-(--on-gold)">
              <UserAvatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} />
            </span>
            <div>
              <div className="font-['Open_Sans',sans-serif] text-lg leading-[1.3] font-bold text-(--text-primary)">
                {user.name}
              </div>
              <span
                className={`mt-1 inline-flex w-fit rounded-full border px-[11px] py-[5px] text-[11.5px] font-bold ${roleChipClass[user.role]}`}
              >
                {roleLabels[user.role]}
              </span>
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

        <div className="grid grid-cols-3 gap-3.5 max-[480px]:grid-cols-1">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Email</div>
            <div className="text-[13.5px] font-bold break-all text-(--text-primary)">{user.email}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Phòng</div>
            <div className="text-[13.5px] font-bold text-(--text-primary)">{user.room ?? '—'}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Tổng điểm</div>
            <div className="text-[13.5px] font-extrabold text-(--gold-bright)">{formatPoints(totalPoints)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-bold text-(--text-secondary)">
            Minh chứng gần đây ({submissions.length})
          </label>
          {recent.length === 0 ? (
            <p className="m-0 text-sm text-(--text-tertiary)">Chưa có minh chứng nào.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-(--hairline) bg-(--surface-tint) px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-(--text-primary)">{s.categoryLabel}</div>
                    <div className="text-[12px] text-(--text-tertiary)">{s.date}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="text-[12.5px] font-extrabold text-(--gold-bright)">+{formatPoints(s.points)}</span>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(217,122,108,0.4)] bg-[rgba(217,122,108,0.1)] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--negative)"
            onClick={onDelete}
          >
            Xóa người dùng
          </button>
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
            onClick={onEdit}
          >
            Sửa thông tin
          </button>
        </div>
      </div>
    </div>
  )
}
