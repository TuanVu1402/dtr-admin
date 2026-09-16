import { useState } from 'react'
import type { AdminUser } from '../types/dtr'
import { SearchIcon } from './icons'

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
    <div className="relative" onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3.5">
          <SearchIcon size={16} />
        </span>
        <input
          className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) py-[11px] pr-3.5 pl-[38px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
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
        <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-[5] flex max-h-[220px] flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-[rgba(37,99,235,0.35)] bg-(--surface-1) p-1.5 shadow-[0_20px_40px_var(--shadow-strong)]">
          <button
            type="button"
            className={`mb-0.5 rounded-lg rounded-b-none border-b border-[rgba(37,99,235,0.2)] px-3 py-2.5 text-left font-inherit text-sm font-bold text-(--gold-bright) hover:bg-[rgba(37,99,235,0.16)] ${
              value === NEW_USER_VALUE ? 'bg-[rgba(37,99,235,0.16)]' : ''
            }`}
            onMouseDown={() => pick(NEW_USER_VALUE)}
          >
            {NEW_USER_LABEL}
          </button>
          {filtered.length === 0 && (
            <div className="px-3 py-2.5 text-[13px] text-(--text-tertiary)">Không tìm thấy tên phù hợp</div>
          )}
          {filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              className={`rounded-lg border-none bg-transparent px-3 py-2.5 text-left font-inherit text-sm text-(--text-primary) hover:bg-[rgba(37,99,235,0.16)] hover:text-(--gold-bright) ${
                user.name === value ? 'bg-[rgba(37,99,235,0.16)] text-(--gold-bright)' : ''
              }`}
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
