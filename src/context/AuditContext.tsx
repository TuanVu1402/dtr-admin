import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Role } from '../types/dtr'

export type AuditAction =
  | 'approve'
  | 'reject'
  | 'create_qr'
  | 'close_qr'
  | 'reopen_qr'
  | 'delete_qr'
  | 'proxy_checkin'
  | 'add_attendee'
  | 'lock_user'
  | 'unlock_user'
  | 'reset_password'
  | 'import_users'
  | 'import_submissions'
  | 'update_category'
  | 'reply_feedback'
  | 'assign_room'

export type AuditEvent = {
  id: string
  at: string
  actor: string
  actorRole: Role
  action: AuditAction
  target: string
  detail?: string
}

type AuditContextValue = {
  events: AuditEvent[]
  logAudit: (input: Omit<AuditEvent, 'id' | 'at'>) => void
}

const STORAGE_KEY = 'dtr-audit-log'
const MAX_EVENTS = 200

const AuditContext = createContext<AuditContextValue | null>(null)

function loadEvents(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuditEvent[]) : []
  } catch {
    return []
  }
}

export const auditActionLabels: Record<AuditAction, string> = {
  approve: 'Duyệt minh chứng',
  reject: 'Từ chối minh chứng',
  create_qr: 'Tạo mã QR',
  close_qr: 'Đóng điểm danh',
  reopen_qr: 'Mở lại điểm danh',
  delete_qr: 'Xóa mã QR',
  proxy_checkin: 'Điểm danh hộ',
  add_attendee: 'Thêm người (không quét QR)',
  lock_user: 'Khóa tài khoản',
  unlock_user: 'Mở khóa tài khoản',
  reset_password: 'Reset mật khẩu',
  import_users: 'Nhập user Excel',
  import_submissions: 'Nhập minh chứng Excel',
  update_category: 'Sửa hạng mục',
  reply_feedback: 'Trả lời phản hồi',
  assign_room: 'Gán phòng hàng loạt',
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AuditEvent[]>(() => loadEvents())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)))
    } catch {
      // localStorage không khả dụng.
    }
  }, [events])

  function logAudit(input: Omit<AuditEvent, 'id' | 'at'>) {
    const event: AuditEvent = {
      ...input,
      id: `AU-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toLocaleString('vi-VN'),
    }
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
  }

  return <AuditContext.Provider value={{ events, logAudit }}>{children}</AuditContext.Provider>
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit must be used within AuditProvider')
  return ctx
}
