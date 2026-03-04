import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCodeImage({
  value,
  size = 128,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let mounted = true
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url: string) => {
        if (mounted) setDataUrl(url)
      })
      .catch(() => {
        if (mounted) setDataUrl('')
      })
    return () => {
      mounted = false
    }
  }, [value, size])

  if (!dataUrl) {
    return <div className={`bg-white/70 ${className || ''}`} style={{ width: size, height: size }} />
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="QR"
      className={className}
    />
  )
}
