import { useRef, useState, type ReactNode } from 'react'
import './HoverPreview.css'

type HoverPreviewProps = {
  children: ReactNode
  /** Nội dung chữ hiển thị trong tooltip — dùng khi không có imageUrl. */
  text?: string
  /** Ảnh minh chứng hiển thị trong tooltip — ưu tiên hơn text nếu có cả hai. */
  imageUrl?: string
  className?: string
}

const IMAGE_SIZE = 220
const TEXT_MAX_WIDTH = 260

/**
 * Tooltip tự tính vị trí bằng JS (getBoundingClientRect + position: fixed) thay vì CSS
 * thuần — để tự chọn bung lên trên hay xuống dưới tùy còn đủ chỗ trống, tránh tràn ra
 * ngoài bảng / đè lên phần đầu trang như cách làm CSS-only trước đó.
 */
export default function HoverPreview({ children, text, imageUrl, className }: HoverPreviewProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [style, setStyle] = useState<{
    top: number
    left: number
    placement: 'top' | 'bottom'
  } | null>(null)

  const boxHeight = imageUrl ? IMAGE_SIZE : 90
  const boxWidth = imageUrl ? IMAGE_SIZE : TEXT_MAX_WIDTH

  function show() {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    const placement = spaceAbove > boxHeight + 16 || spaceAbove > spaceBelow ? 'top' : 'bottom'
    const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - boxWidth - 8)
    setStyle({ top, left, placement })
  }

  function hide() {
    setStyle(null)
  }

  if (!text && !imageUrl) return <>{children}</>

  return (
    <span
      ref={triggerRef}
      className={className}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {style && (
        <div
          className={`hover-preview-box${imageUrl ? ' hover-preview-image' : ''}`}
          style={{
            top: style.placement === 'bottom' ? style.top : undefined,
            bottom: style.placement === 'top' ? window.innerHeight - style.top : undefined,
            left: style.left,
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          }}
        >
          {text}
        </div>
      )}
    </span>
  )
}
