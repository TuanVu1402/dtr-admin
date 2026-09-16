import { useEffect, useRef, useState } from 'react'

type UserMenuProps = {
  name: string
  initials: string
  onLogout: () => void
}

/** Chip avatar + tên ở navbar — bấm vào mở dropdown "Đăng xuất" thay vì hiện thẳng nút
 * Đăng xuất ngay trong thanh navbar. */
export default function UserMenu({ name, initials, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-[rgba(37,99,235,0.32)] bg-(--surface-1) py-1.5 pr-4 pl-1.5 font-inherit dark:border-[rgba(37,99,235,0.22)] dark:bg-[rgba(37,99,235,0.08)] max-[480px]:border-none max-[480px]:bg-transparent max-[480px]:p-0"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Tài khoản"
      >
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-[13px] font-bold text-(--on-gold)">
          {initials}
        </span>
        <span className="text-[13px] font-bold text-(--text-primary) max-[480px]:hidden">{name}</span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 z-[70] flex min-w-[190px] flex-col gap-0.5 rounded-xl border border-[rgba(37,99,235,0.28)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-1.5 shadow-[0_20px_40px_var(--shadow-strong)]">
          <button
            type="button"
            className="block w-full cursor-pointer rounded-lg border-none bg-none px-3 py-2.5 text-left text-[13.5px] font-bold text-(--negative) no-underline hover:bg-[rgba(217,122,108,0.1)] hover:text-(--negative)"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
