import { useState, type FormEvent } from 'react'
import { roleLabels, type AdminUser, type Role } from '../../types/dtr'

export type UserFormValues = {
  name: string
  email: string
  role: Role
  room: string
}

type UserFormModalProps = {
  /** Có user nghĩa là đang sửa, không có nghĩa là đang thêm mới. */
  user?: AdminUser
  allowedRoles: Role[]
  onCancel: () => void
  onSubmit: (values: UserFormValues) => void
}

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'

const roleOrder: Role[] = ['user', 'manager', 'admin', 'support_admin']

export default function UserFormModal({ user, allowedRoles, onCancel, onSubmit }: UserFormModalProps) {
  const isEdit = Boolean(user)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<Role>(
    user?.role && allowedRoles.includes(user.role) ? user.role : (allowedRoles[0] ?? 'user'),
  )
  const [room, setRoom] = useState(user?.room ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) {
      setError('Vui lòng nhập đầy đủ họ tên và email.')
      return
    }
    onSubmit({ name: trimmedName, email: trimmedEmail, role, room: room.trim() })
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
            <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">
              {isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}
            </div>
            <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
              {isEdit ? user!.name : 'Tạo tài khoản mới'}
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
          <label className={fieldLabelClass} htmlFor="user-form-name">
            Họ tên <span>*</span>
          </label>
          <input
            id="user-form-name"
            className={fieldInputClass}
            type="text"
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="user-form-email">
            Email <span>*</span>
          </label>
          <input
            id="user-form-email"
            className={fieldInputClass}
            type="email"
            placeholder="ten@dtr.vn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="user-form-room">
              Phòng
            </label>
            <input
              id="user-form-room"
              className={fieldInputClass}
              type="text"
              placeholder="Phòng Kinh doanh 1"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="user-form-role">
              Vai trò
            </label>
            <select
              id="user-form-role"
              className={`cursor-pointer ${fieldInputClass}`}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {roleOrder.filter((r) => allowedRoles.includes(r)).map((r) => (
                <option key={r} value={r} className="bg-[#fdf8ec] text-[#0d1f3d]">
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-[13px] font-semibold text-(--negative)">{error}</div>}

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
            {isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}
          </button>
        </div>
      </form>
    </div>
  )
}
