/** Mở cửa sổ in — trình duyệt cho "Save as PDF". Dùng cho báo cáo FE không cần thư viện. */
export function exportPdf(title: string, bodyHtml: string) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  document.body.appendChild(frame)

  const doc = frame.contentDocument
  if (!doc) {
    document.body.removeChild(frame)
    return
  }

  doc.open()
  doc.write(`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: "Segoe UI", Arial, sans-serif; color: #0d1f3d; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    p.meta { color: #5a6b82; font-size: 12px; margin: 0 0 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #d5deea; padding: 8px 10px; text-align: left; }
    th { background: #f4f7fb; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Xuất lúc ${new Date().toLocaleString('vi-VN')}</p>
  ${bodyHtml}
</body>
</html>`)
  doc.close()

  const win = frame.contentWindow
  if (!win) {
    document.body.removeChild(frame)
    return
  }

  win.focus()
  win.print()
  window.setTimeout(() => {
    document.body.removeChild(frame)
  }, 800)
}
