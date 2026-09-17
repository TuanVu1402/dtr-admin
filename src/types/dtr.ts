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
  icon: 'booking' | 'deal' | 'training' | 'clip' | 'megaphone' | 'checkin' | 'office' | 'pin'
  pointOptions: PointOption[]
  /** Loại minh chứng cần nộp: ảnh/tệp đính kèm hoặc một đường link (ví dụ link clip). Mặc định 'file'. */
  evidenceType?: 'file' | 'link'
  /** Nhãn nhỏ ghi rõ hạng mục chỉ áp dụng cho nhóm sales nào, ví dụ "Dành cho Sales DTLDN". */
  audienceTag?: string
  /** Nhãn phụ thêm dưới tiêu đề, ví dụ "DN, NT, VT 0,5". */
  audienceTags?: string[]
  /** Danh sách tên dự án/VPBH cụ thể, mỗi cái hiện thành 1 nhãn nhỏ riêng bên dưới tiêu đề —
   * bấm vào bất kỳ nhãn nào cũng mở form nộp minh chứng cho hạng mục này. */
  locationLabels?: string[]
  /** Nộp bằng quét mã QR thay vì form minh chứng. */
  qrCheckin?: boolean
  /** Khi quét QR phải bật GPS / vị trí thiết bị. */
  requireLocation?: boolean
  /** Tắt hạng mục thì sale không nộp được, QR Training cũng ẩn nếu tắt. */
  enabled?: boolean
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
  /** Ảnh minh chứng người dùng tải lên, lưu dạng data URL (bản demo, chưa có backend lưu file thật). */
  imageDataUrl?: string
  /** Lý do từ chối — admin nhập khi bấm "Từ chối". */
  rejectReason?: string
  appealNote?: string
  appealImageDataUrl?: string
  appealedAt?: string
}

export type PointBreakdown = {
  label: string
  count: number
}

/** Các vai trò trong hệ thống. */
export type Role = 'user' | 'admin' | 'support_admin' | 'manager' | 'gdda' | 'dtlo'

export const roleLabels: Record<Role, string> = {
  user: 'Người dùng',
  admin: 'Admin',
  support_admin: 'Suppor Admin',
  manager: 'Manager',
  gdda: 'GĐDA',
  dtlo: 'ĐTLO',
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: Role
  /** Phòng / bộ phận của người dùng, ví dụ "Phòng Kinh doanh 1". */
  room?: string
  /** Ảnh đại diện — URL công khai hoặc data URL. Không có thì bảng xếp hạng hiện chữ cái đầu tên. */
  avatarUrl?: string
  accountStatus?: 'active' | 'locked'
  tempPassword?: string
}

/** Một minh chứng người dùng nộp, nhìn từ phía admin (có thêm tên người nộp). */
export type AdminSubmission = HistoryEntry & {
  userName: string
}

export type FeedbackType = 'bug' | 'suggestion' | 'other'

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: 'Báo lỗi',
  suggestion: 'Góp ý',
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
  assignedTo?: string
  reply?: string
  repliedAt?: string
  emailSentAt?: string
  imageDataUrl?: string
}
