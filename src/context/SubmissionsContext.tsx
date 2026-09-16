import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { adminSubmissions, adminUsers } from '../data/adminData'
import type { AdminSubmission, AdminUser, Role, SubmissionStatus } from '../types/dtr'

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
  addUser: (name: string, email: string, role?: Role, room?: string) => AdminUser
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
const DATA_VERSION = '10'
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
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(() =>
    loadFromStorage(SUBMISSIONS_KEY, adminSubmissions),
  )
  const [users, setUsers] = useState<AdminUser[]>(() => loadFromStorage(USERS_KEY, adminUsers))

  useEffect(() => saveToStorage(SUBMISSIONS_KEY, submissions), [submissions])
  useEffect(() => saveToStorage(USERS_KEY, users), [users])

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === SUBMISSIONS_KEY) setSubmissions(loadFromStorage(SUBMISSIONS_KEY, adminSubmissions))
      if (e.key === USERS_KEY) setUsers(loadFromStorage(USERS_KEY, adminUsers))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  function setStatus(id: string, status: SubmissionStatus) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, rejectReason: undefined } : s)),
    )
  }

  function rejectSubmission(id: string, reason: string) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected', rejectReason: reason } : s)),
    )
  }

  function addSubmission(input: NewSubmissionInput): AdminSubmission {
    const submission: AdminSubmission = { id: generateSubmissionId(), ...input }
    setSubmissions((prev) => [submission, ...prev])
    return submission
  }

  function addUser(name: string, email: string, role: Role = 'user', room?: string): AdminUser {
    const user: AdminUser = { id: generateUserId(), name, email, role, room }
    setUsers((prev) => [...prev, user])
    return user
  }

  function updateUser(id: string, updates: Partial<Omit<AdminUser, 'id'>>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <SubmissionsContext.Provider
      value={{ submissions, users, setStatus, rejectSubmission, addSubmission, addUser, updateUser, deleteUser }}
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
