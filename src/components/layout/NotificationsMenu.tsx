import { useNotifications } from '../../context/NotificationsContext'
import { BellIcon } from '../ui/icons'
import type { NotificationKind } from '../../data/notificationsData'
import { useEffect, useRef, useState } from 'react'

const kindDotClass: Record<NotificationKind, string> = {
  success: 'bg-(--positive)',
  warning: 'bg-(--gold-bright)',
  info: 'bg-[#7ea6e0]',
}

export default function NotificationsMenu() {
  const { items, unreadCount, markAllRead } = useNotifications()
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
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[rgba(37,99,235,0.22)] bg-[rgba(37,99,235,0.08)] text-(--gold)"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-(--bg-1) bg-(--negative) px-1 text-[10.5px] leading-none font-extrabold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+12px)] right-0 z-[70] max-h-[420px] w-[340px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-[rgba(37,99,235,0.28)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] shadow-[0_24px_48px_var(--shadow-strong)] max-[480px]:fixed max-[480px]:top-[64px] max-[480px]:right-3 max-[480px]:left-3 max-[480px]:w-auto max-[480px]:max-w-none max-[480px]:max-h-[min(420px,calc(100svh-88px))]">
          <div className="flex items-center justify-between gap-2.5 border-b border-(--hairline) px-4 py-3.5 text-[13.5px] font-extrabold text-(--text-primary)">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="cursor-pointer border-none bg-none p-0 text-[11.5px] font-bold text-(--gold-bright)"
                onClick={markAllRead}
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <div className="flex flex-col">
            {items.length === 0 && (
              <div className="px-4 py-6 text-center text-[13px] text-(--text-tertiary)">Không có thông báo nào.</div>
            )}
            {items.map((n) => (
              <div
                className={`flex gap-2.5 border-b border-(--hairline) px-4 py-3 last:border-b-0 ${n.read ? '' : 'bg-[rgba(37,99,235,0.06)]'}`}
                key={n.id}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${kindDotClass[n.kind]}`} />
                <div className="flex min-w-0 flex-col gap-[3px]">
                  <div className="text-[13px] font-bold text-(--text-primary)">{n.title}</div>
                  <div className="text-[12.5px] leading-[1.5] text-(--text-tertiary)">{n.description}</div>
                  <div className="mt-0.5 text-[11px] text-(--text-muted)">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
