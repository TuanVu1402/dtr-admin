import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { adminSubmissions, adminUsers } from '../data/adminData'
import type { AdminSubmission, AdminUser, Role, SubmissionStatus } from '../types/dtr'
import type { PermissionKey } from '../types/permission'
import { roleCan } from '../utils/permissions'
import { useAuth } from './AuthContext'
import { useRoles } from './RolesContext'

export type NewSubmissionInput = {
  userName: string
  categoryLabel: string
  description: string
  date: string
  points: number
  status: SubmissionStatus
  link?: string
  imageDataUrl?: string
}

type SubmissionsContextValue = {
  submissions: AdminSubmission[]
  users: AdminUser[]
  setStatus: (id: string, status: SubmissionStatus) => void
  rejectSubmission: (id: string, reason: string) => void
  addSubmission: (input: NewSubmissionInput) => AdminSubmission
  addSubmissions: (inputs: NewSubmissionInput[]) => number
  addUser: (name: string, email: string, role?: Role, room?: string) => AdminUser
  addUsers: (inputs: { name: string; email: string; role?: Role; room?: string }[]) => number
  updateUser: (id: string, updates: Partial<Omit<AdminUser, 'id'>>) => void
  deleteUser: (id: string) => void
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null)

// Trước đây trang User và trang Admin sống chung 1 app React nên chỉ cần giữ state trong RAM
// (cùng 1 SubmissionsProvider) là đã "thấy" dữ liệu của nhau ngay lập tức. Giờ tách thành 2 project
// độc lập, không còn chung 1 cây React nữa — nên phải lưu xuống localStorage và lắng nghe sự kiện
// 'storage' để 2 app vẫn đồng bộ dữ liệu với nhau khi cùng chạy trên 1 origin (ví dụ deploy chung
// domain, khác đường dẫn). Đây cũng là điểm khác biệt duy nhất so với bản gốc: dữ liệu giờ được giữ
// lại qua mỗi lần tải lại trang thay vì mất khi refresh như trước.
const SUBMISSIONS_KEY = 'dtr-submissions'
const USERS_KEY = 'dtr-users'

// Tăng số này mỗi khi sửa dữ liệu mẫu (adminData.ts) — dữ liệu cũ trong localStorage của
// trình duyệt sẽ tự bị bỏ qua và nạp lại dữ liệu mẫu mới nhất, khỏi cần người dùng tự xóa
// localStorage thủ công mỗi lần demo có cập nhật.
const DATA_VERSION = '17'
const VERSION_KEY = 'dtr-data-version'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (localStorage.getItem(VERSION_KEY) !== DATA_VERSION) return fallback
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** URL avatar Vite đổi hash mỗi lần build — luôn lấy lại từ bundle, giữ ảnh upload (data:). */
function hydrateUserAvatars(stored: AdminUser[]): AdminUser[] {
  const byId = new Map(adminUsers.map((u) => [u.id, u.avatarUrl]))
  const byName = new Map(adminUsers.map((u) => [u.name.toLowerCase(), u.avatarUrl]))
  return stored.map((user) => {
    if (user.avatarUrl?.startsWith('data:')) return user
    const fresh = byId.get(user.id) ?? byName.get(user.name.toLowerCase())
    return fresh ? { ...user, avatarUrl: fresh } : user
  })
}

function persistableUsers(users: AdminUser[]): AdminUser[] {
  return users.map((user) => {
    if (user.avatarUrl?.startsWith('data:')) return user
    return { ...user, avatarUrl: undefined }
  })
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(VERSION_KEY, DATA_VERSION)
  } catch {
    // localStorage không khả dụng (chế độ ẩn danh...) — chỉ giữ trong bộ nhớ tạm.
  }
}

function generateSubmissionId() {
  return `MN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function generateUserId() {
  return `NEW-U${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  // Chốt chặn cuối ở tầng dữ liệu: ẩn nút trên giao diện là chưa đủ, ai gọi thẳng hàm
  // qua DevTools vẫn phải bị chặn. Kiểm tra theo QUYỀN (module.action); PHẠM VI dữ liệu
  // kiểm ở nơi gọi vì chỉ ở đó mới biết bản ghi thuộc hạng mục / phòng nào.
  const { role } = useAuth()
  const { roleById } = useRoles()
  const actor = role ? roleById(role) : undefined
  const guard = (key: PermissionKey) => roleCan(actor, key)

  const [submissions, setSubmissions] = useState<AdminSubmission[]>(() =>
    loadFromStorage(SUBMISSIONS_KEY, adminSubmissions),
  )
  const [users, setUsers] = useState<AdminUser[]>(() =>
    hydrateUserAvatars(loadFromStorage(USERS_KEY, adminUsers)),
  )

  useEffect(() => saveToStorage(SUBMISSIONS_KEY, submissions), [submissions])
  useEffect(() => saveToStorage(USERS_KEY, persistableUsers(users)), [users])

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === SUBMISSIONS_KEY) setSubmissions(loadFromStorage(SUBMISSIONS_KEY, adminSubmissions))
      if (e.key === USERS_KEY) setUsers(hydrateUserAvatars(loadFromStorage(USERS_KEY, adminUsers)))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  function setStatus(id: string, status: SubmissionStatus) {
    if (!guard('evidence.approve')) return
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, rejectReason: undefined } : s)),
    )
  }

  function rejectSubmission(id: string, reason: string) {
    if (!guard('evidence.reject')) return
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected', rejectReason: reason } : s)),
    )
  }

  function addSubmission(input: NewSubmissionInput): AdminSubmission {
    const submission: AdminSubmission = { id: generateSubmissionId(), ...input }
    setSubmissions((prev) => [submission, ...prev])
    return submission
  }

  function addSubmissions(inputs: NewSubmissionInput[]): number {
    if (!guard('evidence.import')) return 0
    if (inputs.length === 0) return 0
    const rows = inputs.map((input) => ({ id: generateSubmissionId(), ...input }))
    setSubmissions((prev) => [...rows, ...prev])
    return rows.length
  }

  function addUser(name: string, email: string, role: Role = 'user', room?: string): AdminUser {
    const user: AdminUser = { id: generateUserId(), name, email, role, room, accountStatus: 'active' }
    setUsers((prev) => [...prev, user])
    return user
  }

  function addUsers(inputs: { name: string; email: string; role?: Role; room?: string }[]): number {
    if (!guard('users.import')) return 0
    const existingEmails = new Set(users.map((u) => u.email.toLowerCase()))
    const existingNames = new Set(users.map((u) => u.name.toLowerCase()))
    const fresh: AdminUser[] = []
    for (const input of inputs) {
      const name = input.name.trim()
      const email = input.email.trim()
      if (!name || !email) continue
      if (existingEmails.has(email.toLowerCase()) || existingNames.has(name.toLowerCase())) continue
      existingEmails.add(email.toLowerCase())
      existingNames.add(name.toLowerCase())
      fresh.push({
        id: generateUserId(),
        name,
        email,
        role: input.role ?? 'user',
        room: input.room,
        accountStatus: 'active',
      })
    }
    if (fresh.length > 0) setUsers((prev) => [...prev, ...fresh])
    return fresh.length
  }

  function updateUser(id: string, updates: Partial<Omit<AdminUser, 'id'>>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  function deleteUser(id: string) {
    if (!guard('users.delete')) return
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <SubmissionsContext.Provider
      value={{
        submissions,
        users,
        setStatus,
        rejectSubmission,
        addSubmission,
        addSubmissions,
        addUser,
        addUsers,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </SubmissionsContext.Provider>
  )
}

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext)
  if (!ctx) throw new Error('useSubmissions must be used within SubmissionsProvider')
  return ctx
}
