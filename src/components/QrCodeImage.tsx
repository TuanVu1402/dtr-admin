import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type QrCodeImageProps = {
  value: string
  size?: number
  /** Gọi lại khi QR đã tạo xong, kèm data URL — dùng để tải ảnh QR về máy. */
  onReady?: (dataUrl: string) => void
}

export default function QrCodeImage({ value, size = 168, onReady }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#0d1f3d', light: '#ffffff' } })
      .then((url) => {
        if (cancelled) return
        setDataUrl(url)
        onReady?.(url)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, size])

  if (!dataUrl) {
    return <div className="rounded-xl bg-[rgba(255,255,255,0.06)]" style={{ width: size, height: size }} />
  }

  return <img className="block rounded-xl" src={dataUrl} width={size} height={size} alt="Mã QR điểm danh" />
}
