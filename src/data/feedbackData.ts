import type { FeedbackEntry } from '../types/dtr'

/**
 * Dữ liệu phản hồi mẫu — dùng làm giá trị khởi tạo cho FeedbackContext khi
 * localStorage chưa có gì (lần đầu mở trang admin), để mục "Phản hồi" có nội
 * dung minh hoạ thay vì trống trơn. Tên người gửi lấy theo adminData.ts.
 */
export const feedbackEntries: FeedbackEntry[] = [
  {
    id: 'FB-1006',
    type: 'bug',
    content: 'Bảng xếp hạng load chậm trên mạng 4G, đợi gần 10 giây mới hiện dữ liệu.',
    email: 'khanh.tran@dtr.vn',
    createdAt: '13/9/2026 08:02:19',
    status: 'new',
  },
  {
    id: 'FB-1005',
    type: 'suggestion',
    content: 'Thêm thông báo đẩy khi minh chứng được duyệt, hiện tại phải tự vào web kiểm tra.',
    email: 'an.nguyen@dtr.vn',
    createdAt: '12/9/2026 19:30:00',
    status: 'new',
  },
  {
    id: 'FB-1004',
    type: 'other',
    content: 'Cho hỏi điểm DTR có quy đổi ra thưởng tiền mặt không hay chỉ để xếp hạng thôi ạ?',
    createdAt: '10/9/2026 14:12:55',
    status: 'resolved',
  },
  {
    id: 'FB-1003',
    type: 'bug',
    content: 'Ảnh minh chứng tải lên bị xoay ngang dù ảnh gốc đang thẳng.',
    email: 'thu.le@dtr.vn',
    createdAt: '09/9/2026 08:47:02',
    status: 'resolved',
  },
  {
    id: 'FB-1002',
    type: 'suggestion',
    content: 'Mong thêm bộ lọc theo tháng ở trang Lịch sử để dễ theo dõi điểm từng tháng.',
    email: 'khanh.tran@dtr.vn',
    createdAt: '07/9/2026 16:05:41',
    status: 'new',
  },
  {
    id: 'FB-1001',
    type: 'bug',
    content: 'Khi bấm "Gửi yêu cầu chấm điểm" ở mục Booking, nút bị đơ vài giây rồi mới chuyển trang.',
    email: 'an.nguyen@dtr.vn',
    createdAt: '05/9/2026 09:24:10',
    status: 'resolved',
  },
]
