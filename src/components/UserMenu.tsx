import { useEffect, useRef, useState } from 'react'
import './UserMenu.css'

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
    <div className="user-menu-root" ref={rootRef}>
      <button
        type="button"
        className="user-chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Tài khoản"
      >
        <span className="avatar">{initials}</span>
        <span className="user-name">{name}</span>
      </button>

      {open && (
        <div className="user-menu-panel">
          <button
            type="button"
            className="user-menu-item user-menu-logout"
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
