import { useState } from 'react'
import type { AdminUser } from '../types/dtr'
import { SearchIcon } from './icons'
import '../styles/shared.css'
import './UserPicker.css'

export const NEW_USER_VALUE = '__new__'
const NEW_USER_LABEL = '+ Tạo người mới…'

type UserPickerProps = {
  users: AdminUser[]
  value: string
  onChange: (value: string) => void
}

export default function UserPicker({ users, value, onChange }: UserPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedLabel = value === NEW_USER_VALUE ? NEW_USER_LABEL : value
  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.trim().toLowerCase()))

  function pick(next: string) {
    onChange(next)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="user-picker" onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <div className="search-input-wrap">
        <SearchIcon size={16} />
        <input
          className="field-input search-input"
          type="text"
          value={open ? query : selectedLabel}
          placeholder="Tìm tên người nộp..."
          onFocus={(e) => {
            setOpen(true)
            setQuery('')
            e.target.select()
          }}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {open && (
        <div className="user-picker-list">
          <button
            type="button"
            className={`user-picker-item new${value === NEW_USER_VALUE ? ' active' : ''}`}
            onMouseDown={() => pick(NEW_USER_VALUE)}
          >
            {NEW_USER_LABEL}
          </button>
          {filtered.length === 0 && <div className="user-picker-empty">Không tìm thấy tên phù hợp</div>}
          {filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              className={`user-picker-item${user.name === value ? ' active' : ''}`}
              onMouseDown={() => pick(user.name)}
            >
              {user.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
