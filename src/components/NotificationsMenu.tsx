import { useEffect, useRef, useState } from 'react'
import { BellIcon } from './icons'
import { initialNotifications, type AppNotification, type NotificationKind } from '../data/notificationsData'
import './NotificationsMenu.css'

const kindDotClass: Record<NotificationKind, string> = {
  success: 'notif-dot-success',
  warning: 'notif-dot-warning',
  info: 'notif-dot-info',
}

export default function NotificationsMenu() {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const unreadCount = items.filter((n) => !n.read).length

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

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="notif-root" ref={rootRef}>
      <button
        className="icon-btn notif-bell-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
      >
        <BellIcon />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-all" onClick={markAllRead}>
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <div className="notif-list">
            {items.length === 0 && <div className="notif-empty">Không có thông báo nào.</div>}
            {items.map((n) => (
              <div className={`notif-item${n.read ? '' : ' unread'}`} key={n.id}>
                <span className={`notif-dot ${kindDotClass[n.kind]}`} />
                <div className="notif-item-body">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-desc">{n.description}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
