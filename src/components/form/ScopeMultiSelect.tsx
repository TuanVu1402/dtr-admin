import { useEffect, useRef, useState } from 'react'

export type ScopeOption = { value: string; label: string }

type ScopeMultiSelectProps = {
  options: ScopeOption[]
  /** null = "Tất cả". Mảng rỗng = chưa chọn gì (không có phạm vi nào). */
  value: string[] | null
  onChange: (value: string[] | null) => void
  placeholder?: string
  disabled?: boolean
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Ô chọn phạm vi dữ liệu dạng chip, giống dropdown "Tất cả ×" trong thiết kế.
 * Chọn "Tất cả" sẽ xóa mọi lựa chọn cụ thể và ngược lại.
 */
export default function ScopeMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn phạm vi...',
  disabled,
}: ScopeMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const isAll = value === null
  const selected = value ?? []
  const filtered = query.trim()
    ? options.filter((o) => normalize(o.label).includes(normalize(query.trim())))
    : options

  function toggleOption(optionValue: string) {
    if (isAll) {
      // Đang là "Tất cả" mà bỏ tick 1 cái → chuyển sang liệt kê phần còn lại.
      onChange(options.filter((o) => o.value !== optionValue).map((o) => o.value))
      return
    }
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue]
    onChange(next.length === options.length ? null : next)
  }

  return (
    <div className="relative" ref={rootRef}>
      <div
        className={`flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3 py-2 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        {isAll ? (
          <span className="inline-flex items-center gap-1.5 rounded border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-2 py-1 text-[12.5px] font-semibold text-(--text-primary)">
            Tất cả
          </span>
        ) : selected.length === 0 ? (
          <span className="text-[13px] text-(--text-muted)">{placeholder}</span>
        ) : (
          selected.map((v) => {
            const option = options.find((o) => o.value === v)
            return (
              <span
                key={v}
                className="inline-flex max-w-full items-center gap-1.5 rounded border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-2 py-1 text-[12.5px] font-semibold text-(--text-primary)"
              >
                <span className="truncate">{option?.label ?? v}</span>
                <button
                  type="button"
                  className="cursor-pointer border-none bg-transparent leading-none text-(--text-tertiary) hover:text-(--negative)"
                  aria-label={`Bỏ ${option?.label ?? v}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(selected.filter((x) => x !== v))
                  }}
                >
                  ×
                </button>
              </span>
            )
          })
        )}
        <span className="ml-auto shrink-0 text-(--text-tertiary)">▾</span>
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 max-h-[260px] w-full overflow-y-auto rounded-[10px] border border-[rgba(37,99,235,0.28)] bg-(--surface-1) p-1.5 shadow-[0_18px_40px_var(--shadow)]">
          <input
            className="mb-1.5 w-full rounded-lg border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-2.5 py-1.5 text-[13px] text-(--text-primary) focus:border-(--gold) focus:outline-none"
            placeholder="Tìm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-bold text-(--text-primary) hover:bg-[rgba(37,99,235,0.08)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-(--gold)"
              checked={isAll}
              onChange={() => onChange(isAll ? [] : null)}
            />
            Tất cả
          </label>
          {filtered.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-(--text-secondary) hover:bg-[rgba(37,99,235,0.08)]"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-(--gold)"
                checked={isAll || selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              <span className="truncate">{option.label}</span>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="px-2.5 py-2 text-[13px] text-(--text-tertiary)">Không tìm thấy.</p>
          )}
        </div>
      )}
    </div>
  )
}
