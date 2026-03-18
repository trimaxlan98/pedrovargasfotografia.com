import { useState, useRef, useEffect, useCallback } from 'react'
import { ZoomIn, ZoomOut, Check, Loader } from 'lucide-react'

// Output resolution — 9:16 portrait
const OUT_W = 1080
const OUT_H = 1920

// Display crop viewport — fits in max-w-xs (320px) with padding
const CROP_W = 252
const CROP_H = 448  // 252 * 16/9 = 448

interface Props {
  file: File
  pageLabel?: string
  onConfirm: (file: File) => void
  onCancel: () => void
}

export default function ImageCropModal({ file, pageLabel, onConfirm, onCancel }: Props) {
  const imgRef     = useRef<HTMLImageElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const cropDivRef = useRef<HTMLDivElement>(null)

  const [imgSrc,      setImgSrc]      = useState('')
  const [nat,         setNat]         = useState({ w: 0, h: 0 })
  const [scale,       setScale]       = useState(1)
  const [offset,      setOffset]      = useState({ x: 0, y: 0 })
  const [isDragging,  setIsDragging]  = useState(false)
  const [isProcessing,setIsProcessing]= useState(false)

  // Refs hold current values for imperative event handlers (avoid stale closures)
  const scaleRef  = useRef(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const natRef    = useRef({ w: 0, h: 0 })
  const dragRef   = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const pinchRef  = useRef<number | null>(null)

  // Sync state → refs
  const setScaleSync  = (s: number)              => { scaleRef.current  = s;      setScale(s) }
  const setOffsetSync = (o: { x: number; y: number }) => { offsetRef.current = o; setOffset(o) }

  // Object URL lifecycle
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getMin = () => {
    const { w, h } = natRef.current
    return w && h ? Math.max(CROP_W / w, CROP_H / h) : 1
  }

  const clamp = (ox: number, oy: number, s: number): { x: number; y: number } => {
    const { w, h } = natRef.current
    const maxX = Math.max(0, (w * s - CROP_W) / 2)
    const maxY = Math.max(0, (h * s - CROP_H) / 2)
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    }
  }

  const applyZoom = useCallback((factor: number) => {
    const min  = getMin()
    const next = Math.max(min, Math.min(scaleRef.current * factor, min * 6))
    const clamped = clamp(offsetRef.current.x, offsetRef.current.y, next)
    setScaleSync(next)
    setOffsetSync(clamped)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Image load ─────────────────────────────────────────────────────────────

  const handleLoad = () => {
    const img = imgRef.current!
    const w = img.naturalWidth
    const h = img.naturalHeight
    natRef.current = { w, h }
    setNat({ w, h })
    const s = Math.max(CROP_W / w, CROP_H / h)
    setScaleSync(s)
    setOffsetSync({ x: 0, y: 0 })
  }

  // ── Mouse ──────────────────────────────────────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
    setIsDragging(true)
  }

  // Global mouse handlers — capture even when cursor leaves the crop div
  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const next = clamp(
        dragRef.current.ox + (e.clientX - dragRef.current.sx),
        dragRef.current.oy + (e.clientY - dragRef.current.sy),
        scaleRef.current,
      )
      setOffsetSync(next)
    }
    const onUp = () => {
      dragRef.current = null
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  // ── Touch — MUST be imperative with passive:false to allow preventDefault ──

  useEffect(() => {
    const el = cropDivRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0]
        dragRef.current  = { sx: t.clientX, sy: t.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
        pinchRef.current = null
      } else if (e.touches.length === 2) {
        dragRef.current = null
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        pinchRef.current = Math.sqrt(dx * dx + dy * dy)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()  // blocks page scroll — only works with passive:false
      if (e.touches.length === 2) {
        // Pinch zoom
        const dx   = e.touches[0].clientX - e.touches[1].clientX
        const dy   = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (pinchRef.current !== null && pinchRef.current > 0) {
          const factor  = dist / pinchRef.current
          const min     = getMin()
          const next    = Math.max(min, Math.min(scaleRef.current * factor, min * 6))
          const clamped = clamp(offsetRef.current.x, offsetRef.current.y, next)
          setScaleSync(next)
          setOffsetSync(clamped)
        }
        pinchRef.current = dist
      } else if (e.touches.length === 1 && dragRef.current) {
        // Pan
        const t    = e.touches[0]
        const next = clamp(
          dragRef.current.ox + (t.clientX - dragRef.current.sx),
          dragRef.current.oy + (t.clientY - dragRef.current.sy),
          scaleRef.current,
        )
        setOffsetSync(next)
      }
    }

    const onTouchEnd = () => {
      dragRef.current  = null
      pinchRef.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // Empty deps — all values accessed via refs

  // ── Scroll zoom ────────────────────────────────────────────────────────────

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    applyZoom(e.deltaY < 0 ? 1.1 : 0.91)
  }

  // ── Zoom bar click ─────────────────────────────────────────────────────────

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const min  = getMin()
    const next = min + pct * (min * 5 - min)
    const clamped = clamp(offsetRef.current.x, offsetRef.current.y, next)
    setScaleSync(next)
    setOffsetSync(clamped)
  }

  // ── Confirm: export canvas ─────────────────────────────────────────────────

  const handleConfirm = () => {
    const img    = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas || !nat.w) return

    setIsProcessing(true)
    canvas.width  = OUT_W
    canvas.height = OUT_H
    const ctx = canvas.getContext('2d')!

    const s    = scaleRef.current
    const { x: ox, y: oy } = offsetRef.current
    const { w: nw, h: nh } = natRef.current

    const srcX = Math.max(0, nw / 2 - CROP_W / (2 * s) - ox / s)
    const srcY = Math.max(0, nh / 2 - CROP_H / (2 * s) - oy / s)
    const srcW = Math.min(CROP_W / s, nw - srcX)
    const srcH = Math.min(CROP_H / s, nh - srcY)

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT_W, OUT_H)

    canvas.toBlob(blob => {
      setIsProcessing(false)
      if (!blob) return
      const name = file.name.replace(/\.[^.]+$/, '') + '_crop.jpg'
      onConfirm(new File([blob], name, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const imgW    = nat.w * scale
  const imgH    = nat.h * scale
  const min     = nat.w ? Math.max(CROP_W / nat.w, CROP_H / nat.h) : 1
  const zoomPct = min > 0 ? Math.min(100, ((scale - min) / (min * 5)) * 100) : 0
  const scalePct = Math.round((scale / min) * 100)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <p className="label-caps text-gold/70 text-[0.57rem] mb-0.5">{pageLabel ?? 'Plantilla'}</p>
            <h4 className="font-cormorant text-ivory text-lg leading-tight">Ajustar encuadre</h4>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ivory/30 hover:text-ivory hover:bg-white/8 transition-colors text-base"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 space-y-3">

          {/* Instruction */}
          <p className="text-ivory/30 text-[0.65rem] font-dm text-center tracking-wide">
            Arrastra · Pellizca para zoom · Scroll en escritorio
          </p>

          {/* Crop viewport */}
          <div className="flex justify-center">
            <div
              ref={cropDivRef}
              className="relative overflow-hidden rounded-xl select-none touch-none"
              style={{
                width:  CROP_W,
                height: CROP_H,
                background: '#000',
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: '0 0 0 1px rgba(201,169,110,0.25), 0 8px 32px rgba(0,0,0,0.6)',
              }}
              onMouseDown={onMouseDown}
              onWheel={onWheel}
            >
              {/* Image */}
              {imgSrc && (
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt=""
                  onLoad={handleLoad}
                  draggable={false}
                  style={{
                    position:       'absolute',
                    width:          imgW || '100%',
                    height:         imgH || 'auto',
                    left:           nat.w ? CROP_W / 2 + offset.x - imgW / 2 : 0,
                    top:            nat.w ? CROP_H / 2 + offset.y - imgH / 2 : 0,
                    pointerEvents:  'none',
                    willChange:     'transform',
                  }}
                />
              )}

              {/* Loading skeleton */}
              {!nat.w && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/4 animate-pulse">
                  <Loader size={20} className="text-gold/40 animate-spin" />
                </div>
              )}

              {/* Rule-of-thirds grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: [
                    'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                    'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                  ].join(', '),
                  backgroundSize: `${CROP_W / 3}px ${CROP_H / 3}px`,
                }}
              />

              {/* Corner brackets */}
              {[
                'top-0    left-0  border-t-2 border-l-2',
                'top-0    right-0 border-t-2 border-r-2',
                'bottom-0 left-0  border-b-2 border-l-2',
                'bottom-0 right-0 border-b-2 border-r-2',
              ].map(cls => (
                <div key={cls} className={`absolute ${cls} w-5 h-5 border-gold/70`} />
              ))}

              {/* Zoom indicator (top-right) */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 pointer-events-none">
                <p className="text-ivory/60 text-[0.58rem] font-dm tabular-nums">{scalePct}%</p>
              </div>

              {/* Aspect label */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 pointer-events-none">
                <p className="text-ivory/40 text-[0.55rem] font-dm tracking-[0.18em]">9 : 16</p>
              </div>
            </div>
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={() => applyZoom(0.87)}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-ivory/40 hover:text-ivory hover:border-white/25 transition-colors flex-shrink-0"
            >
              <ZoomOut size={14} />
            </button>

            <div
              className="flex-1 h-2 bg-white/8 rounded-full relative cursor-pointer group"
              onClick={onBarClick}
            >
              {/* Track fill */}
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-gold/40 to-gold/70 pointer-events-none"
                style={{ width: `${zoomPct}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold shadow-md pointer-events-none transition-none"
                style={{ left: `calc(${zoomPct}% - 7px)` }}
              />
            </div>

            <button
              onClick={() => applyZoom(1.15)}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-ivory/40 hover:text-ivory hover:border-white/25 transition-colors flex-shrink-0"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Hint */}
          <p className="text-ivory/20 text-[0.6rem] font-dm text-center">
            El área visible se exportará como 1080 × 1920 px
          </p>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="px-4 pb-5 pt-2 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 btn-outline py-2.5 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!nat.w || isProcessing}
            className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isProcessing
              ? <><Loader size={13} className="animate-spin" /> Procesando…</>
              : <><Check size={13} /> Usar este encuadre</>
            }
          </button>
        </div>

      </div>
    </div>
  )
}
