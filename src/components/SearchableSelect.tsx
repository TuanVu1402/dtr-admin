import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchIcon } from './icons'

export type SearchableOption = {
  value: string
  label: string
}

type SearchableSelectProps = {
  id?: string
  options: SearchableOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/** Bỏ dấu tiếng Việt để gõ "nguyen thi" vẫn tìm ra "Nguyễn Thị". */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

/**
 * Ô chọn có ô tìm kiếm — thay cho <select> ở những danh sách dài (người nộp, phòng,
 * hạng mục). Gõ vài chữ là danh sách lọc ngay thay vì phải cuộn tìm bằng mắt.
 */
export default function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Nhập để tìm...',
}: SearchableSelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return options
    return options.filter((o) => normalize(o.label).includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Giữ mục đang được chọn bằng bàn phím luôn nằm trong vùng nhìn thấy của danh sách.
  useEffect(() => {
    if (!open) return
    listRef.current?.children[highlight]?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  function openList() {
    setOpen(true)
    setQuery('')
    setHighlight(Math.max(0, filtered.findIndex((o) => o.value === value)))
  }

  function pick(next: string) {
    onChange(next)
    setQuery('')
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        openList()
        return
      }
      const step = e.key === 'ArrowDown' ? 1 : -1
      setHighlight((h) => (h + step + filtered.length) % Math.max(1, filtered.length))
      return
    }
    if (e.key === 'Enter' && open) {
      e.preventDefault()
      const option = filtered[highlight]
      if (option) pick(option.value)
      return
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3.5">
          <SearchIcon size={16} />
        </span>
        <input
          id={id}
          className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) py-[11px] pr-3.5 pl-[38px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={id ? `${id}-listbox` : undefined}
          autoComplete="off"
          value={open ? query : selectedLabel}
          placeholder={open ? placeholder : selectedLabel}
          onFocus={openList}
          onClick={openList}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlight(0)
            setOpen(true)
          }}
        />
      </div>

      {open && (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          ref={listRef}
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-20 flex max-h-[240px] flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-[rgba(37,99,235,0.35)] bg-(--surface-1) p-1.5 shadow-[0_20px_40px_var(--shadow-strong)]"
        >
          {filtered.length === 0 && (
            <div className="px-3 py-2.5 text-[13px] text-(--text-tertiary)">Không tìm thấy mục phù hợp</div>
          )}
          {filtered.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`rounded-lg border-none bg-transparent px-3 py-2.5 text-left font-inherit text-sm text-(--text-primary) ${
                index === highlight ? 'bg-[rgba(37,99,235,0.16)] text-(--gold-bright)' : ''
              } ${option.value === value ? 'font-bold text-(--gold-bright)' : ''}`}
              onMouseEnter={() => setHighlight(index)}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(option.value)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
