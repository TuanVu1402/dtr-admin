/** Xuất mảng dữ liệu ra file CSV (mở được bằng Excel) và tự tải về máy. */
export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (cell: string | number) => {
    const text = String(cell)
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','))
  // Thêm BOM để Excel nhận đúng chữ có dấu (UTF-8) thay vì hiển thị lỗi font.
  const csvContent = '﻿' + lines.join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
