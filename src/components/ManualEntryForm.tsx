import { useState, type FormEvent } from 'react'
import { useSubmissions, type NewSubmissionInput } from '../context/SubmissionsContext'
import { categories } from '../data/dtrData'
import type { SubmissionStatus } from '../types/dtr'
import { formatPoints, slugify } from '../utils/format'
import UserPicker, { NEW_USER_VALUE } from './UserPicker'
import '../styles/shared.css'
import './ManualEntryForm.css'

type FlatOption = {
  key: string
  categoryLabel: string
  points: number
  evidenceType?: 'file' | 'link'
}

const flatOptions: FlatOption[] = categories.flatMap((category) =>
  category.pointOptions.map((option) => ({
    key: `${category.id}::${option.label}`,
    categoryLabel: option.label === 'Điểm' ? category.title : option.label,
    points: option.points,
    evidenceType: category.evidenceType,
  })),
)

const statusOptions: { label: string; value: SubmissionStatus }[] = [
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Từ chối', value: 'rejected' },
]

type ManualEntryFormProps = {
  onCancel: () => void
  onSubmit: (input: NewSubmissionInput) => void
}

export default function ManualEntryForm({ onCancel, onSubmit }: ManualEntryFormProps) {
  const { users, addUser } = useSubmissions()
  // Chỉ những tài khoản vai trò "Người dùng" (sales) mới là người nộp minh chứng —
  // Admin / Manager / Support Admin là nhân sự vận hành, không nộp minh chứng.
  const submitterUsers = users.filter((user) => user.role === 'user')

  const [selectedUser, setSelectedUser] = useState(submitterUsers[0]?.name ?? NEW_USER_VALUE)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [optionKey, setOptionKey] = useState(flatOptions[0]?.key ?? '')
  const [date, setDate] = useState('')
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
    <div className="form-overlay" onClick={onCancel}>
      <form className="form-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <div className="form-eyebrow">Nhập minh chứng thủ công</div>
            <div className="form-title">Ghi nhận thay cho người dùng</div>
          </div>
          <button type="button" className="form-close" onClick={onCancel} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="field">
          <label className="field-label">Người nộp</label>
          <UserPicker users={submitterUsers} value={selectedUser} onChange={setSelectedUser} />
        </div>

        {isNewUser && (
          <div className="manual-form-grid">
            <div className="field">
              <label className="field-label" htmlFor="manual-new-name">
                Họ tên người mới
              </label>
              <input
                id="manual-new-name"
                className="field-input"
                type="text"
                placeholder="Nguyễn Văn A"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="manual-new-email">
                Email (tuỳ chọn)
              </label>
              <input
                id="manual-new-email"
                className="field-input"
                type="email"
                placeholder="ten@dtr.vn"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="field">
          <label className="field-label" htmlFor="manual-category">
            Hạng mục
          </label>
          <select
            id="manual-category"
            className="field-input"
            value={optionKey}
            onChange={(e) => setOptionKey(e.target.value)}
          >
            {flatOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.categoryLabel} · {formatPoints(option.points)} điểm
              </option>
            ))}
          </select>
        </div>

        <div className="manual-form-grid">
          <div className="field">
            <label className="field-label" htmlFor="manual-date">
              Ngày thực hiện
            </label>
            <input
              id="manual-date"
              className="field-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="manual-status">
              Trạng thái
            </label>
            <select
              id="manual-status"
              className="field-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="manual-desc">
            Mô tả / ghi chú
          </label>
          <textarea
            id="manual-desc"
            className="field-input field-textarea"
            placeholder="Ví dụ: Dự án, mã booking, tên sự kiện, nhóm khách hàng..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {selectedOption?.evidenceType === 'link' && (
          <div className="field">
            <label className="field-label" htmlFor="manual-link">
              Link minh chứng (tuỳ chọn)
            </label>
            <input
              id="manual-link"
              className="field-input"
              type="url"
              placeholder="Dán link clip..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="btn-primary">
            Lưu minh chứng
          </button>
        </div>
      </form>
    </div>
  )
}
