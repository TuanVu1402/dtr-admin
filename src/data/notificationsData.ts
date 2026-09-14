export type NotificationKind = 'success' | 'warning' | 'info'

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  description: string
  time: string
  read: boolean
}

/** Thông báo mẫu cho chuông thông báo ở trang Admin — dữ liệu minh hoạ, chưa nối API thật. */
export const initialNotifications: AppNotification[] = [
  {
    id: 'N1',
    kind: 'warning',
    title: '3 minh chứng mới chờ duyệt',
    description: 'Có 3 minh chứng mới cần Manager xét duyệt trong mục Chấm điểm.',
    time: '10 phút trước',
    read: false,
  },
  {
    id: 'N2',
    kind: 'info',
    title: 'Minh chứng mới được gửi',
    description: 'Lê Minh Thư vừa gửi minh chứng Booking — Dự án The Marq.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 'N3',
    kind: 'warning',
    title: 'Phản hồi mới cần xử lý',
    description: 'Trần Bảo Khánh báo lỗi: bảng xếp hạng load chậm trên mạng 4G.',
    time: '3 giờ trước',
    read: false,
  },
  {
    id: 'N4',
    kind: 'success',
    title: 'Báo cáo tuần',
    description: '24 minh chứng được duyệt trong tuần, tổng 86 điểm DTR đã cộng cho người dùng.',
    time: '1 ngày trước',
    read: true,
  },
  {
    id: 'N5',
    kind: 'info',
    title: 'Tài khoản mới đăng ký',
    description: 'Nguyễn Văn Bình vừa đăng ký tài khoản với vai trò Người dùng.',
    time: '2 ngày trước',
    read: true,
  },
]
