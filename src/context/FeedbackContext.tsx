import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { feedbackEntries } from '../data/feedbackData'
import type { FeedbackEntry, FeedbackStatus, FeedbackType } from '../types/dtr'

const STORAGE_KEY = 'dtr-feedback-entries'

type FeedbackContextValue = {
  feedbackList: FeedbackEntry[]
  addFeedback: (type: FeedbackType, content: string, email?: string, imageDataUrl?: string) => void
  setFeedbackStatus: (id: string, status: FeedbackStatus) => void
  updateFeedback: (id: string, updates: Partial<FeedbackEntry>) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return feedbackEntries
    // Mảng rỗng coi như "chưa có dữ liệu" (kể cả khi đã từng lưu [] từ trước khi có
    // mock data) để mục Phản hồi luôn có sẵn nội dung minh hoạ thay vì trống trơn.
    const parsed = JSON.parse(raw) as FeedbackEntry[]
    return parsed.length > 0 ? parsed : feedbackEntries
  } catch {
    return feedbackEntries
  }
}

function generateId() {
  return `FB-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() => loadFeedback())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackList))
    } catch {
      // localStorage không khả dụng (chế độ ẩn danh...) — chỉ giữ trong bộ nhớ tạm.
    }
  }, [feedbackList])

  function addFeedback(type: FeedbackType, content: string, email?: string, imageDataUrl?: string) {
    const entry: FeedbackEntry = {
      id: generateId(),
      type,
      content,
      email: email || undefined,
      imageDataUrl,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'new',
    }
    setFeedbackList((prev) => [entry, ...prev])
  }

  function setFeedbackStatus(id: string, status: FeedbackStatus) {
    setFeedbackList((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)))
  }

  function updateFeedback(id: string, updates: Partial<FeedbackEntry>) {
    setFeedbackList((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  return (
    <FeedbackContext.Provider value={{ feedbackList, addFeedback, setFeedbackStatus, updateFeedback }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider')
  return ctx
}
