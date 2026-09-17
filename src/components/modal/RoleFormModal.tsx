import { useState, type FormEvent } from 'react'
import type { RoleDefinition } from '../../types/permission'

type RoleFormModalProps = {
  /** Có role nghĩa là đang sửa thông tin, không có nghĩa là tạo mới. */
  role?: RoleDefinition
  existingRoles: RoleDefinition[]
  onCancel: () => void
  onSubmit: (values: { name: string; description: string; copyFrom?: string }) => void
}

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'

export default function RoleFormModal({ role, existingRoles, onCancel, onSubmit }: RoleFormModalProps) {
  const isEdit = Boolean(role)
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [copyFrom, setCopyFrom] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Vui lòng nhập tên vai trò.')
      return
    }
    const duplicate = existingRoles.some(
      (r) => r.id !== role?.id && r.name.trim().toLowerCase() === trimmed.toLowerCase(),
    )
    if (duplicate) {
      setError('Đã có vai trò trùng tên.')
      return
    }
    onSubmit({ name: trimmed, description: description.trim(), copyFrom: copyFrom || undefined })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px] max-[640px]:items-end max-[640px]:p-0"
      onClick={onCancel}
    >
      <form
        className="flex max-h-[90svh] w-full max-w-[460px] flex-col gap-5 overflow-y-auto rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)] max-[640px]:rounded-b-none max-[640px]:p-5"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">
              {isEdit ? 'Sửa vai trò' : 'Thêm vai trò'}
            </div>
            <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg font-bold text-(--text-primary)">
              {isEdit ? role!.name : 'Tạo vai trò mới'}
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
          <label className={fieldLabelClass} htmlFor="role-form-name">
            Tên vai trò <span>*</span>
          </label>
          <input
            id="role-form-name"
            className={fieldInputClass}
            type="text"
            placeholder="Ví dụ: Trưởng phòng Kinh doanh"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="role-form-desc">
            Mô tả
          </label>
          <input
            id="role-form-desc"
            className={fieldInputClass}
            type="text"
            placeholder="Vai trò này làm gì trong hệ thống"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {!isEdit && (
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="role-form-copy">
              Sao chép quyền từ
            </label>
            <select
              id="role-form-copy"
              className={`cursor-pointer ${fieldInputClass}`}
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
            >
              <option value="" className="bg-[#fdf8ec] text-[#0d1f3d]">
                Bắt đầu với vai trò trống
              </option>
              {existingRoles
                .filter((r) => !r.isSuper)
                .map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#fdf8ec] text-[#0d1f3d]">
                    {r.name}
                  </option>
                ))}
            </select>
            <span className="text-[12px] text-(--text-tertiary)">
              Tạo xong bấm "Phân quyền" để tick chức năng và phạm vi dữ liệu.
            </span>
          </div>
        )}

        {error && <div className="text-[13px] font-semibold text-(--negative)">{error}</div>}

        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
            onClick={onCancel}
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo vai trò'}
          </button>
        </div>
      </form>
    </div>
  )
}
