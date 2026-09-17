import { useMemo, useState, type FormEvent } from 'react'
import { useSubmissions, type NewSubmissionInput } from '../../context/SubmissionsContext'
import { useCategories } from '../../context/CategoriesContext'
import type { SubmissionStatus } from '../../types/dtr'
import { formatPoints, slugify } from '../../utils/format'
import UserPicker, { NEW_USER_VALUE } from './UserPicker'

type ManualEntryFormProps = {
  onCancel: () => void
  onSubmit: (input: NewSubmissionInput) => void
}

const statusOptions: { label: string; value: SubmissionStatus }[] = [
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Từ chối', value: 'rejected' },
]

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'

export default function ManualEntryForm({ onCancel, onSubmit }: ManualEntryFormProps) {
  const { users, addUser } = useSubmissions()
  const { categories } = useCategories()
  const flatOptions = useMemo(
    () =>
      categories
        .filter((category) => category.enabled !== false)
        .flatMap((category) =>
          category.pointOptions.map((option) => ({
            key: `${category.id}::${option.label}`,
            categoryLabel: option.label === 'Điểm' ? category.title : option.label,
            points: option.points,
            evidenceType: category.evidenceType,
          })),
        ),
    [categories],
  )
  // Chỉ những tài khoản vai trò "Người dùng" (sales) mới là người nộp minh chứng —
  // Admin / Manager / GĐDA / ĐTLO / Super Admin là nhân sự vận hành, không nộp minh chứng.
  const submitterUsers = users.filter((user) => user.role === 'user')

  const [selectedUser, setSelectedUser] = useState(submitterUsers[0]?.name ?? NEW_USER_VALUE)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [optionKey, setOptionKey] = useState(flatOptions[0]?.key ?? '')
  const [date, setDate] = useState(() => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  })
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<SubmissionStatus>('approved')
  const [link, setLink] = useState('')

  const isNewUser = selectedUser === NEW_USER_VALUE
  const selectedOption = flatOptions.find((o) => o.key === optionKey) ?? flatOptions[0]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedOption) return

    let userName = selectedUser
    if (isNewUser) {
      const name = newUserName.trim()
      if (!name) return
      const email = newUserEmail.trim() || `${slugify(name)}@dtr.vn`
      const user = addUser(name, email)
      userName = user.name
    }

    onSubmit({
      userName,
      categoryLabel: selectedOption.categoryLabel,
      description: description || '—',
      date: date ? new Date(date).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      points: selectedOption.points,
      status,
      link: selectedOption.evidenceType === 'link' && link ? link : undefined,
    })
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
              Nhập minh chứng thủ công
            </div>
            <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
              Ghi nhận thay cho người dùng
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
          <label className={fieldLabelClass}>Người nộp</label>
          <UserPicker users={submitterUsers} value={selectedUser} onChange={setSelectedUser} />
        </div>

        {isNewUser && (
          <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
            <div className="flex flex-col gap-2">
              <label className={fieldLabelClass} htmlFor="manual-new-name">
                Họ tên người mới
              </label>
              <input
                id="manual-new-name"
                className={fieldInputClass}
                type="text"
                placeholder="Nguyễn Văn A"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={fieldLabelClass} htmlFor="manual-new-email">
                Email (tuỳ chọn)
              </label>
              <input
                id="manual-new-email"
                className={fieldInputClass}
                type="email"
                placeholder="ten@dtr.vn"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="manual-category">
            Hạng mục
          </label>
          <select
            id="manual-category"
            className={`cursor-pointer ${fieldInputClass}`}
            value={optionKey}
            onChange={(e) => setOptionKey(e.target.value)}
          >
            {flatOptions.map((option) => (
              <option key={option.key} value={option.key} className="bg-[#fdf8ec] text-[#0d1f3d]">
                {option.categoryLabel} · {formatPoints(option.points)} điểm
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="manual-date">
              Ngày thực hiện
            </label>
            <input
              id="manual-date"
              className={fieldInputClass}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="manual-status">
              Trạng thái
            </label>
            <select
              id="manual-status"
              className={`cursor-pointer ${fieldInputClass}`}
              value={status}
              onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#fdf8ec] text-[#0d1f3d]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="manual-desc">
            Mô tả / ghi chú
          </label>
          <textarea
            id="manual-desc"
            className={`min-h-[88px] resize-y ${fieldInputClass}`}
            placeholder="Ví dụ: Dự án, mã booking, tên sự kiện, nhóm khách hàng..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {selectedOption?.evidenceType === 'link' && (
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="manual-link">
              Link minh chứng (tuỳ chọn)
            </label>
            <input
              id="manual-link"
              className={fieldInputClass}
              type="url"
              placeholder="Dán link clip..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
        )}

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
            Lưu minh chứng
          </button>
        </div>
      </form>
    </div>
  )
}
