import type { AdminSubmission, AdminUser } from '../types/dtr'

export const adminUsers: AdminUser[] = [
  { id: 'u1', name: 'Nguyễn An', email: 'an.nguyen@dtr.vn', role: 'user' },
  { id: 'u2', name: 'Trần Bảo Khánh', email: 'khanh.tran@dtr.vn', role: 'user' },
  { id: 'u3', name: 'Lê Minh Thư', email: 'thu.le@dtr.vn', role: 'user' },
  { id: 'u4', name: 'Phạm Quốc Huy', email: 'huy.pham@dtr.vn', role: 'manager' },
  { id: 'u5', name: 'Đỗ Thanh Hằng', email: 'hang.do@dtr.vn', role: 'admin' },
  { id: 'u6', name: 'Vũ Lan Anh', email: 'lananh.vu@dtr.vn', role: 'support_admin' },
]

/**
 * Nguồn dữ liệu minh chứng DUY NHẤT — dùng chung cho trang User (lọc theo tên của
 * chính mình) và trang Admin (xem toàn bộ). Tránh tạo dữ liệu mẫu trùng lặp ở nơi khác.
 */
export const adminSubmissions: AdminSubmission[] = [
  // Nguyễn An
  {
    id: 'GD-1042',
    userName: 'Nguyễn An',
    categoryLabel: 'Giao dịch',
    description: 'Căn hộ The Marq — booking #GD-1042',
    date: '12/09/2026',
    points: 5,
    status: 'approved',
  },
  {
    id: 'CK-0891',
    userName: 'Nguyễn An',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 6 KH — Sự kiện Vinhomes Ocean Park',
    date: '10/09/2026',
    points: 1,
    status: 'pending',
  },
  {
    id: 'TR-0512',
    userName: 'Nguyễn An',
    categoryLabel: 'Training / Kick off',
    description: 'Kick off Quý 3 — tham dự trọn buổi',
    date: '05/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'CL-0233',
    userName: 'Nguyễn An',
    categoryLabel: 'Clip DTLO',
    description: 'Clip review dự án Sun Grand City',
    date: '02/09/2026',
    points: 1,
    status: 'rejected',
    link: 'https://youtube.com/watch?v=example',
  },
  {
    id: 'BK-3391',
    userName: 'Nguyễn An',
    categoryLabel: 'Booking',
    description: 'Dự án Lumi Hà Nội — booking #BK-3391',
    date: '28/08/2026',
    points: 4,
    status: 'approved',
  },
  // Trần Bảo Khánh
  {
    id: 'BK-2210',
    userName: 'Trần Bảo Khánh',
    categoryLabel: 'Booking',
    description: 'Dự án Eaton Park — booking #BK-2210',
    date: '30/08/2026',
    points: 4,
    status: 'pending',
  },
  {
    id: 'CK-0905',
    userName: 'Trần Bảo Khánh',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 4 KH — Sự kiện Sun Grand City',
    date: '06/09/2026',
    points: 1,
    status: 'approved',
  },
  // Lê Minh Thư
  {
    id: 'BK-2233',
    userName: 'Lê Minh Thư',
    categoryLabel: 'Booking',
    description: 'Dự án The Marq — booking #BK-2233',
    date: '27/08/2026',
    points: 4,
    status: 'approved',
  },
  {
    id: 'CL-0250',
    userName: 'Lê Minh Thư',
    categoryLabel: 'Clip DTLO',
    description: 'Clip giới thiệu dự án Blanca City',
    date: '03/09/2026',
    points: 1,
    status: 'approved',
    link: 'https://youtube.com/watch?v=example2',
  },
]
