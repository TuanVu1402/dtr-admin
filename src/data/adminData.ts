import type { AdminSubmission, AdminUser } from '../types/dtr'

import laiNgocTuyenAvatar from '../assets/avatars/lai-ngoc-tuyen.png'
import nguyenCongThienAvatar from '../assets/avatars/nguyen-cong-thien.png'
import nguyenHoangLongAvatar from '../assets/avatars/nguyen-hoang-long.png'
import nguyenHuuThaiAvatar from '../assets/avatars/nguyen-huu-thai.png'
import nguyenMinhTanAvatar from '../assets/avatars/nguyen-minh-tan.png'
import nguyenNgocThienTamAvatar from '../assets/avatars/nguyen-ngoc-thien-tam.png'
import nguyenQuocTinAvatar from '../assets/avatars/nguyen-quoc-tin.png'
import nguyenThienAnAvatar from '../assets/avatars/nguyen-thien-an.png'
import nguyenThiKhanhHuongAvatar from '../assets/avatars/nguyen-thi-khanh-huong.png'
import nguyenThiThuongAvatar from '../assets/avatars/nguyen-thi-thuong.png'
import nguyenThiYenNhiAvatar from '../assets/avatars/nguyen-thi-yen-nhi.png'
import nguyenDatLoiAvatar from '../assets/avatars/nguyen-dat-loi.png'
import nguyenDoLinhDungAvatar from '../assets/avatars/nguyen-do-linh-dung.png'
import nguyenDucThinhAvatar from '../assets/avatars/nguyen-duc-thinh.png'
import ngoQuocDaiAvatar from '../assets/avatars/ngo-quoc-dai.png'
import ngoThaiBaoAvatar from '../assets/avatars/ngo-thai-bao.png'
import ngoTanHungAvatar from '../assets/avatars/ngo-tan-hung.png'
import tangGiaHuyAvatar from '../assets/avatars/tang-gia-huy.png'
import tangLeHaAvatar from '../assets/avatars/tang-le-ha.png'
import taKhoiNguyenAvatar from '../assets/avatars/ta-khoi-nguyen.png'

export const adminUsers: AdminUser[] = [
  { id: 'u1', name: 'Lai Ngọc Tuyền', email: 'an.nguyen@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 1', avatarUrl: laiNgocTuyenAvatar },
  { id: 'u2', name: 'Nguyễn Công Thiện', email: 'khanh.tran@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 2', avatarUrl: nguyenCongThienAvatar },
  { id: 'u3', name: 'Nguyễn Hoàng Long', email: 'thu.le@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 1', avatarUrl: nguyenHoangLongAvatar },
  { id: 'u7', name: 'Nguyễn Hữu Thái', email: 'bao.hoang@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 3', avatarUrl: nguyenHuuThaiAvatar },
  { id: 'u8', name: 'Nguyễn Minh Tân', email: 'duong.ngo@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 2', avatarUrl: nguyenMinhTanAvatar },
  { id: 'u9', name: 'Nguyễn Ngọc Thiện Tâm', email: 'anh.bui@dtr.vn', role: 'user', room: 'Phòng Kinh doanh DTLDN', avatarUrl: nguyenNgocThienTamAvatar },
  { id: 'u10', name: 'Nguyễn Quốc Tín', email: 'linh.dang@dtr.vn', role: 'user', room: 'Phòng Kinh doanh DTLNT', avatarUrl: nguyenQuocTinAvatar },
  { id: 'u11', name: 'Nguyễn Thiên Ân', email: 'my.vuong@dtr.vn', role: 'user', room: 'Phòng Kinh doanh DTLVT', avatarUrl: nguyenThienAnAvatar },
  { id: 'u12', name: 'Nguyễn Thị Khánh Hường', email: 'minh.phan@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 3', avatarUrl: nguyenThiKhanhHuongAvatar },
  { id: 'u13', name: 'Nguyễn Thị Thương', email: 'yen.dinh@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 1', avatarUrl: nguyenThiThuongAvatar },
  { id: 'u14', name: 'Nguyễn Thị Yến Nhi', email: 'tuan.trinh@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 2', avatarUrl: nguyenThiYenNhiAvatar },
  { id: 'u15', name: 'Nguyễn Đạt Lợi', email: 'ngoc.lam@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 3', avatarUrl: nguyenDatLoiAvatar },
  { id: 'u16', name: 'Nguyễn Đỗ Linh Dung', email: 'phat.doan@dtr.vn', role: 'user', room: 'Phòng Kinh doanh DTLDN', avatarUrl: nguyenDoLinhDungAvatar },
  { id: 'u17', name: 'Nguyễn Đức Thịnh', email: 'chi.nguyen@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 1', avatarUrl: nguyenDucThinhAvatar },
  { id: 'u18', name: 'Ngô Quốc Đại', email: 'nam.vo@dtr.vn', role: 'user', room: 'Phòng Kinh doanh DTLNT', avatarUrl: ngoQuocDaiAvatar },
  { id: 'u19', name: 'Ngô Thái Bảo', email: 'han.truong@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 2', avatarUrl: ngoThaiBaoAvatar },
  { id: 'u20', name: 'Ngô Tấn Hưng', email: 'duc.ly@dtr.vn', role: 'user', room: 'Phòng Kinh doanh DTLVT', avatarUrl: ngoTanHungAvatar },
  { id: 'u21', name: 'Tăng Gia Huy', email: 'vy.phung@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 3', avatarUrl: tangGiaHuyAvatar },
  { id: 'u22', name: 'Tăng Lệ Hà', email: 'khoa.ho@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 1', avatarUrl: tangLeHaAvatar },
  { id: 'u23', name: 'Tạ Khôi Nguyên', email: 'anh.duong@dtr.vn', role: 'user', room: 'Phòng Kinh doanh 2', avatarUrl: taKhoiNguyenAvatar },
  { id: 'u4', name: 'Phạm Quốc Huy', email: 'huy.pham@dtr.vn', role: 'manager', room: 'Phòng Quản lý' },
  { id: 'u5', name: 'Đỗ Thanh Hằng', email: 'hang.do@dtr.vn', role: 'admin', room: 'Phòng Vận hành' },
  { id: 'u6', name: 'Vũ Lan Anh', email: 'lananh.vu@dtr.vn', role: 'support_admin', room: 'Phòng Hỗ trợ' },
]

/**
 * Nguồn dữ liệu minh chứng DUY NHẤT — dùng chung cho trang User (lọc theo tên của
 * chính mình) và trang Admin (xem toàn bộ). Tránh tạo dữ liệu mẫu trùng lặp ở nơi khác.
 */
const rawAdminSubmissions: AdminSubmission[] = [
  // Lai Ngọc Tuyền
  {
    id: 'GD-1042',
    userName: 'Lai Ngọc Tuyền',
    categoryLabel: 'Giao dịch',
    description: 'Căn hộ The Marq — booking #GD-1042',
    date: '12/09/2026',
    points: 5,
    status: 'approved',
  },
  {
    id: 'CK-0891',
    userName: 'Lai Ngọc Tuyền',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 6 KH — Sự kiện Vinhomes Ocean Park',
    date: '10/09/2026',
    points: 1,
    status: 'pending',
  },
  {
    id: 'TR-0512',
    userName: 'Lai Ngọc Tuyền',
    categoryLabel: 'Training / Kick off',
    description: 'Kick off Quý 3 — tham dự trọn buổi',
    date: '05/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'CL-0233',
    userName: 'Lai Ngọc Tuyền',
    categoryLabel: 'Clip DTLO',
    description: 'Clip review dự án Sun Grand City',
    date: '02/09/2026',
    points: 1,
    status: 'rejected',
    link: 'https://youtube.com/watch?v=example',
  },
  {
    id: 'BK-3391',
    userName: 'Lai Ngọc Tuyền',
    categoryLabel: 'Booking',
    description: 'Dự án Lumi Hà Nội — booking #BK-3391',
    date: '28/08/2026',
    points: 4,
    status: 'approved',
  },
  // Nguyễn Công Thiện
  {
    id: 'BK-2210',
    userName: 'Nguyễn Công Thiện',
    categoryLabel: 'Booking',
    description: 'Dự án Eaton Park — booking #BK-2210',
    date: '30/08/2026',
    points: 4,
    status: 'pending',
  },
  {
    id: 'CK-0905',
    userName: 'Nguyễn Công Thiện',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 4 KH — Sự kiện Sun Grand City',
    date: '06/09/2026',
    points: 1,
    status: 'approved',
  },
  // Nguyễn Hoàng Long
  {
    id: 'BK-2233',
    userName: 'Nguyễn Hoàng Long',
    categoryLabel: 'Booking',
    description: 'Dự án The Marq — booking #BK-2233',
    date: '27/08/2026',
    points: 4,
    status: 'approved',
  },
  {
    id: 'CL-0250',
    userName: 'Nguyễn Hoàng Long',
    categoryLabel: 'Clip DTLO',
    description: 'Clip giới thiệu dự án Blanca City',
    date: '03/09/2026',
    points: 1,
    status: 'approved',
    link: 'https://youtube.com/watch?v=example2',
  },
  // Nguyễn Hữu Thái
  {
    id: 'GD-1105',
    userName: 'Nguyễn Hữu Thái',
    categoryLabel: 'Giao dịch',
    description: 'Căn hộ Vinhomes Ocean Park — booking #GD-1105',
    date: '14/09/2026',
    points: 5,
    status: 'approved',
  },
  {
    id: 'BK-1106',
    userName: 'Nguyễn Hữu Thái',
    categoryLabel: 'Booking',
    description: 'Dự án Lumi Hà Nội — booking #BK-1106',
    date: '11/09/2026',
    points: 4,
    status: 'approved',
  },
  {
    id: 'CK-1107',
    userName: 'Nguyễn Hữu Thái',
    categoryLabel: 'Check-in với KH tại VPBH Vin Cần Giờ, Vin Hóc Môn, Vin Green City',
    description: 'Check-in KH tại VPBH Vin Green City',
    date: '13/09/2026',
    points: 1,
    status: 'pending',
  },
  // Nguyễn Minh Tân
  {
    id: 'BK-1201',
    userName: 'Nguyễn Minh Tân',
    categoryLabel: 'Booking',
    description: 'Dự án Eaton Park — booking #BK-1201',
    date: '09/09/2026',
    points: 4,
    status: 'approved',
  },
  {
    id: 'TR-1202',
    userName: 'Nguyễn Minh Tân',
    categoryLabel: 'Training / Kick off',
    description: 'Kick off Quý 3 — tham dự trọn buổi',
    date: '05/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'CK-1203',
    userName: 'Nguyễn Minh Tân',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 3 KH — Sự kiện Sun Grand City',
    date: '08/09/2026',
    points: 1,
    status: 'approved',
  },
  // Nguyễn Ngọc Thiện Tâm
  {
    id: 'GD-1301',
    userName: 'Nguyễn Ngọc Thiện Tâm',
    categoryLabel: 'Giao dịch',
    description: 'Căn hộ Blanca City — booking #GD-1301',
    date: '07/09/2026',
    points: 5,
    status: 'approved',
  },
  {
    id: 'CL-1302',
    userName: 'Nguyễn Ngọc Thiện Tâm',
    categoryLabel: 'Clip DTLO',
    description: 'Clip review dự án Caraworld',
    date: '04/09/2026',
    points: 1,
    status: 'rejected',
  },
  // Nguyễn Quốc Tín
  {
    id: 'BK-1401',
    userName: 'Nguyễn Quốc Tín',
    categoryLabel: 'Booking',
    description: 'Dự án Sun Grand City — booking #BK-1401',
    date: '10/09/2026',
    points: 4,
    status: 'approved',
  },
  // Nguyễn Thiên Ân
  {
    id: 'CK-1501',
    userName: 'Nguyễn Thiên Ân',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 2 KH — Sự kiện Eaton Park',
    date: '09/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'TR-1502',
    userName: 'Nguyễn Thiên Ân',
    categoryLabel: 'Training / Kick off',
    description: 'Buổi Training kỹ năng chốt sale',
    date: '02/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'CK-1503',
    userName: 'Nguyễn Thiên Ân',
    categoryLabel: 'Check-in với KH tại VPBH Charmora, Vin Pearl Bay, Alora, Caraworld',
    description: 'Check-in KH tại VPBH Charmora',
    date: '12/09/2026',
    points: 0.5,
    status: 'pending',
  },
  // Nguyễn Thị Khánh Hường
  {
    id: 'TR-1601',
    userName: 'Nguyễn Thị Khánh Hường',
    categoryLabel: 'Training / Kick off',
    description: 'Kick off Quý 3 — tham dự trọn buổi',
    date: '05/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'CK-1602',
    userName: 'Nguyễn Thị Khánh Hường',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 1 KH — Sự kiện Vinhomes Ocean Park',
    date: '11/09/2026',
    points: 1,
    status: 'approved',
  },
  // Nguyễn Thị Thương — vừa tham gia, chưa có minh chứng nào
  // Nguyễn Thị Yến Nhi
  {
    id: 'CK-1701',
    userName: 'Nguyễn Thị Yến Nhi',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 2 KH — Sự kiện Blanca City',
    date: '13/09/2026',
    points: 1,
    status: 'approved',
  },
  // Nguyễn Đạt Lợi
  {
    id: 'TR-1801',
    userName: 'Nguyễn Đạt Lợi',
    categoryLabel: 'Training / Kick off',
    description: 'Kick off Quý 3 — tham dự trọn buổi',
    date: '05/09/2026',
    points: 1,
    status: 'approved',
  },
  // Nguyễn Đỗ Linh Dung
  {
    id: 'CK-1901',
    userName: 'Nguyễn Đỗ Linh Dung',
    categoryLabel: 'Check-in với KH tại VPBH Hải Vân Bay, Sun Group DN',
    description: 'Check-in KH tại VPBH Hải Vân Bay',
    date: '10/09/2026',
    points: 0.5,
    status: 'approved',
  },
  // Nguyễn Đức Thịnh
  {
    id: 'BK-2001',
    userName: 'Nguyễn Đức Thịnh',
    categoryLabel: 'Booking',
    description: 'Dự án Lumi Hà Nội — booking #BK-2001',
    date: '08/09/2026',
    points: 4,
    status: 'approved',
  },
  // Ngô Quốc Đại — chưa có minh chứng nào
  // Ngô Thái Bảo
  {
    id: 'CK-2101',
    userName: 'Ngô Thái Bảo',
    categoryLabel: 'Check-in với KH tại VPBH Vin Cần Giờ, Vin Hóc Môn, Vin Green City',
    description: 'Check-in KH tại VPBH Vin Green City',
    date: '09/09/2026',
    points: 1,
    status: 'approved',
  },
  // Ngô Tấn Hưng
  {
    id: 'CK-2201',
    userName: 'Ngô Tấn Hưng',
    categoryLabel: 'Check-in với KH tại VPBH Blanca, Maia',
    description: 'Check-in KH tại VPBH Blanca',
    date: '11/09/2026',
    points: 0.5,
    status: 'approved',
  },
  // Tăng Gia Huy
  {
    id: 'GD-2301',
    userName: 'Tăng Gia Huy',
    categoryLabel: 'Giao dịch',
    description: 'Căn hộ Eaton Park — booking #GD-2301',
    date: '06/09/2026',
    points: 5,
    status: 'approved',
  },
  // Tăng Lệ Hà
  {
    id: 'TR-2401',
    userName: 'Tăng Lệ Hà',
    categoryLabel: 'Training / Kick off',
    description: 'Buổi Training kỹ năng chốt sale',
    date: '02/09/2026',
    points: 1,
    status: 'approved',
  },
  {
    id: 'CK-2402',
    userName: 'Tăng Lệ Hà',
    categoryLabel: 'Check-in sự kiện',
    description: 'Nhóm 1 KH — Sự kiện Lumi Hà Nội',
    date: '12/09/2026',
    points: 1,
    status: 'approved',
  },
  // Tạ Khôi Nguyên — chưa có minh chứng nào
]

/** Ảnh minh chứng demo dạng SVG (không cần tải mạng) — dùng cho các minh chứng mẫu có sẵn
 * vốn chưa từng qua bước tải ảnh thật, để tính năng hover xem ảnh có dữ liệu để hiển thị. */
function buildPlaceholderImage(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480">
    <rect width="100%" height="100%" fill="#eef2f9"/>
    <rect x="20" y="20" width="440" height="440" rx="18" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="10 8"/>
    <text x="50%" y="44%" text-anchor="middle" font-family="Arial, sans-serif" font-size="48">📷</text>
    <text x="50%" y="56%" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#33415a">Ảnh minh chứng</text>
    <text x="50%" y="64%" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#767e96">${label}</text>
  </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const adminSubmissions: AdminSubmission[] = rawAdminSubmissions.map((s) =>
  s.link ? s : { ...s, imageDataUrl: buildPlaceholderImage(s.categoryLabel) },
)
