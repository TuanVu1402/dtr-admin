import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { initialNotifications, type AppNotification, type NotificationKind } from '../data/notificationsData'

type NotificationsContextValue = {
  items: AppNotification[]
  unreadCount: number
  pushNotification: (input: { kind: NotificationKind; title: string; description: string }) => void
  markAllRead: () => void
}

const STORAGE_KEY = 'dtr-admin-notifications'

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

function loadItems(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialNotifications
    const parsed = JSON.parse(raw) as AppNotification[]
    return parsed.length > 0 ? parsed : initialNotifications
  } catch {
    return initialNotifications
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>(() => loadItems())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
    } catch {
      // localStorage không khả dụng.
    }
  }, [items])

  function pushNotification(input: { kind: NotificationKind; title: string; description: string }) {
    const item: AppNotification = {
      id: `N-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      kind: input.kind,
      title: input.title,
      description: input.description,
      time: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      read: false,
    }
    setItems((prev) => [item, ...prev].slice(0, 50))
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = items.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider value={{ items, unreadCount, pushNotification, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
