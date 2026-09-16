import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GearIcon, PersonIcon } from '../ui/icons'

type UserMenuProps = {
  name: string
  initials: string
  onLogout: () => void
}

type MenuCoords = {
  top: number
  right: number
}

const menuItemClass =
  'flex min-h-11 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent px-3 py-2.5 text-left font-inherit text-[13.5px] font-bold whitespace-nowrap no-underline'

/** Chip avatar + tên ở navbar. Dropdown dùng position:fixed để không bị header cắt mất
 * các dòng Hồ sơ / Cài đặt trên màn hình laptop. */
export default function UserMenu({ name, initials, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<MenuCoords>({ top: 0, right: 16 })
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if (!open) return

    function updatePosition() {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function goTo(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-[rgba(37,99,235,0.32)] bg-(--surface-1) py-1.5 pr-4 pl-1.5 font-inherit dark:border-[rgba(37,99,235,0.22)] dark:bg-[rgba(37,99,235,0.08)] max-[900px]:pr-1.5 max-[480px]:border-none max-[480px]:bg-transparent max-[480px]:p-0"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Tài khoản"
      >
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-[13px] font-bold text-(--on-gold)">
          {initials}
        </span>
        <span className="text-[13px] font-bold text-(--text-primary) max-[900px]:hidden">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="fixed z-[200] flex w-[220px] flex-col gap-0.5 rounded-[10px] border border-[rgba(37,99,235,0.28)] bg-(--surface-1) p-1.5 shadow-[0_20px_40px_var(--shadow-strong)]"
          style={{ top: coords.top, right: coords.right }}
        >
          <button
            type="button"
            role="menuitem"
            className={`${menuItemClass} text-(--text-primary) hover:bg-[rgba(37,99,235,0.1)] hover:text-(--gold-bright)`}
            onClick={() => goTo('/profile')}
          >
            <PersonIcon size={16} /> Hồ sơ cá nhân
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${menuItemClass} text-(--text-primary) hover:bg-[rgba(37,99,235,0.1)] hover:text-(--gold-bright)`}
            onClick={() => goTo('/settings')}
          >
            <GearIcon size={16} /> Cài đặt
          </button>
          <div className="mx-1 my-1 h-px shrink-0 bg-(--hairline)" />
          <button
            type="button"
            role="menuitem"
            className={`${menuItemClass} text-(--negative) hover:bg-[rgba(217,122,108,0.1)]`}
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
