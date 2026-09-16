import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type QrCodeImageProps = {
  value: string
  size?: number
}

export default function QrCodeImage({ value, size = 168 }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#0d1f3d', light: '#f4ecd8' } })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) {
    return <div className="rounded-xl bg-[rgba(255,255,255,0.06)]" style={{ width: size, height: size }} />
  }

  return <img className="block rounded-xl" src={dataUrl} width={size} height={size} alt="Mã QR điểm danh" />
}
