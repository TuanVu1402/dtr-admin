/** Hiển thị số điểm theo kiểu Việt Nam, ví dụ 0.5 -> "0,5". */
export function formatPoints(points: number): string {
  return points.toString().replace('.', ',')
}

/** Parse ngày dạng "dd/mm/yyyy" (định dạng dùng trong toàn bộ dữ liệu mẫu) thành Date để sắp xếp. */
export function parseVNDate(text: string): Date {
  const [d, m, y] = text.split('/').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1)
}

/** Lấy chữ cái đầu (họ + tên) làm avatar viết tắt, ví dụ "Đỗ Thanh Hằng" -> "ĐH". */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Chuyển tên có dấu thành chuỗi không dấu, dùng để gợi ý email mặc định. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}
