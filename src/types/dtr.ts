export type SubmissionStatus = 'approved' | 'pending' | 'rejected'

export type PointOption = {
  label: string
  points: number
}

export type Category = {
  id: string
  number: string
  title: string
  description: string
  icon: 'booking' | 'training' | 'clip' | 'checkin' | 'office'
  pointOptions: PointOption[]
  /** Loại minh chứng cần nộp: ảnh/tệp đính kèm hoặc một đường link (ví dụ link clip). Mặc định 'file'. */
  evidenceType?: 'file' | 'link'
  /** Nhãn nhỏ ghi rõ hạng mục chỉ áp dụng cho nhóm sales nào, ví dụ "Dành cho Sales DTLDN". */
  audienceTag?: string
}

export type HistoryEntry = {
  id: string
  categoryLabel: string
  description: string
  date: string
  points: number
  status: SubmissionStatus
  /** Link minh chứng (dùng cho hạng mục nộp bằng link, ví dụ link clip). */
  link?: string
}

export type PointBreakdown = {
  label: string
  count: number
}

/** 4 vai trò trong hệ thống. */
export type Role = 'user' | 'admin' | 'support_admin' | 'manager'

export const roleLabels: Record<Role, string> = {
  user: 'Người dùng',
  admin: 'Admin',
  support_admin: 'Support Admin',
  manager: 'Manager',
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: Role
}

/** Một minh chứng người dùng nộp, nhìn từ phía admin (có thêm tên người nộp). */
export type AdminSubmission = HistoryEntry & {
  userName: string
}

export type FeedbackType = 'bug' | 'suggestion' | 'other'

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: 'Báo lỗi',
  suggestion: 'Góp ý cải thiện',
  other: 'Khác',
}

export type FeedbackStatus = 'new' | 'resolved'

/** Một phản hồi / báo cáo góp ý người dùng gửi từ Trang chủ User. */
export type FeedbackEntry = {
  id: string
  type: FeedbackType
  content: string
  email?: string
  createdAt: string
  status: FeedbackStatus
}
