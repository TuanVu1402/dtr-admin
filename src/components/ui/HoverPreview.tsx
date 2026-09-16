import { useRef, useState, type ReactNode } from 'react'

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

function canHoverPreview() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * Tooltip chỉ hiện trên máy có chuột. Điện thoại tap sẽ mở modal, không bung ô preview
 * (tránh đè lên chi tiết minh chứng).
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
    if (!canHoverPreview()) return
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
      onPointerDown={hide}
    >
      {children}
      {style && (
        <div
          className={
            imageUrl
              ? 'pointer-events-none h-[220px] w-[220px] overflow-hidden rounded-[10px] border border-[rgba(37,99,235,0.2)] bg-(--surface-2) bg-cover bg-center shadow-[0_12px_28px_var(--shadow-strong)]'
              : 'pointer-events-none w-max max-w-[260px] rounded-lg border border-[rgba(37,99,235,0.3)] bg-(--surface-2) px-3 py-2 text-[12.5px] leading-[1.4] font-semibold whitespace-pre-line text-(--text-primary) shadow-[0_12px_28px_var(--shadow-strong)]'
          }
          style={{
            position: 'fixed',
            zIndex: 40,
            top: style.placement === 'bottom' ? style.top : undefined,
            bottom: style.placement === 'top' ? window.innerHeight - style.top : undefined,
            left: style.left,
            backgroundImage: imageUrl ? `url(${JSON.stringify(imageUrl)})` : undefined,
          }}
        >
          {text}
        </div>
      )}
    </span>
  )
}
