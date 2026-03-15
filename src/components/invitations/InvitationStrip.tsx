import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, MessageCircle, MapPin, X, Gift, Instagram } from 'lucide-react'
import {
  ApiInvitation,
  getDemoGalleryForTemplate,
  resolveInvitationImageUrl,
} from './invitationTypes'
import QrCodeImage from './QrCodeImage'

// â”€â”€ Template styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type TemplateStyle = {
  isDark: boolean
  bg: string
  heroOverlay: string
  accent: string
  text: string
  textMuted: string
  glass: string
  glassBorder: string
  divider: string
  rsvpBg: string
  rsvpText: string
  ornament: string
}

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  warm: {
    isDark: false,
    bg: 'linear-gradient(180deg, #fdf6ee 0%, #f5e8d4 50%, #ecdbc0 100%)',
    heroOverlay:
      'radial-gradient(circle at 30% 20%, rgba(168,114,58,0.18), transparent 60%), radial-gradient(circle at 75% 65%, rgba(197,150,100,0.14), transparent 55%)',
    accent: '#a8723a',
    text: '#2b1a10',
    textMuted: 'rgba(43,26,16,0.5)',
    glass: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(168,114,58,0.18)',
    divider: 'rgba(168,114,58,0.15)',
    rsvpBg: 'rgba(168,114,58,0.1)',
    rsvpText: '#a8723a',
    ornament: '*',
  },
  floral: {
    isDark: false,
    bg: 'linear-gradient(180deg, #fdf0f4 0%, #f8e4ee 50%, #f2d8e6 100%)',
    heroOverlay:
      'radial-gradient(circle at 25% 25%, rgba(181,96,122,0.16), transparent 55%), radial-gradient(circle at 80% 60%, rgba(220,140,165,0.12), transparent 50%)',
    accent: '#b5607a',
    text: '#3a1422',
    textMuted: 'rgba(58,20,34,0.5)',
    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(181,96,122,0.18)',
    divider: 'rgba(181,96,122,0.14)',
    rsvpBg: 'rgba(181,96,122,0.1)',
    rsvpText: '#b5607a',
    ornament: 'o',
  },
  rustic: {
    isDark: true,
    bg: 'linear-gradient(180deg, #1e1008 0%, #2e1a0a 50%, #1e1208 100%)',
    heroOverlay:
      'radial-gradient(circle at 35% 20%, rgba(201,169,110,0.2), transparent 60%), radial-gradient(circle at 75% 70%, rgba(160,110,60,0.15), transparent 55%)',
    accent: '#c9a96e',
    text: '#f5f0e8',
    textMuted: 'rgba(245,240,232,0.5)',
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(201,169,110,0.2)',
    divider: 'rgba(201,169,110,0.15)',
    rsvpBg: '#c9a96e',
    rsvpText: '#1e1008',
    ornament: '+',
  },
  moderno: {
    isDark: true,
    bg: 'linear-gradient(180deg, #08101e 0%, #0e1a2e 50%, #08101e 100%)',
    heroOverlay:
      'radial-gradient(circle at 30% 20%, rgba(123,174,224,0.15), transparent 60%), radial-gradient(circle at 70% 70%, rgba(80,130,200,0.1), transparent 55%)',
    accent: '#7baee0',
    text: '#e8edf8',
    textMuted: 'rgba(232,237,248,0.5)',
    glass: 'rgba(255,255,255,0.04)',
    glassBorder: 'rgba(123,174,224,0.18)',
    divider: 'rgba(123,174,224,0.12)',
    rsvpBg: '#7baee0',
    rsvpText: '#08101e',
    ornament: '#',
  },
  vintage: {
    isDark: false,
    bg: 'linear-gradient(180deg, #f3e8d5 0%, #e8d5bc 50%, #dcc4a4 100%)',
    heroOverlay:
      'radial-gradient(circle at 30% 20%, rgba(120,75,30,0.14), transparent 60%), radial-gradient(circle at 75% 70%, rgba(150,100,50,0.1), transparent 55%)',
    accent: '#7a4a1e',
    text: '#2c1810',
    textMuted: 'rgba(44,24,16,0.52)',
    glass: 'rgba(255,245,225,0.58)',
    glassBorder: 'rgba(122,74,30,0.2)',
    divider: 'rgba(122,74,30,0.15)',
    rsvpBg: 'rgba(122,74,30,0.1)',
    rsvpText: '#7a4a1e',
    ornament: 'âœ¦',
  },
  pearl: {
    isDark: false,
    bg: 'linear-gradient(180deg, #fafafa 0%, #f2f2f8 50%, #e8e8f2 100%)',
    heroOverlay:
      'radial-gradient(circle at 25% 20%, rgba(160,155,195,0.14), transparent 55%), radial-gradient(circle at 78% 65%, rgba(130,128,172,0.09), transparent 50%)',
    accent: '#7878aa',
    text: '#1a1a2e',
    textMuted: 'rgba(26,26,46,0.5)',
    glass: 'rgba(255,255,255,0.68)',
    glassBorder: 'rgba(120,120,170,0.2)',
    divider: 'rgba(120,120,170,0.14)',
    rsvpBg: 'rgba(120,120,170,0.1)',
    rsvpText: '#5858a0',
    ornament: 'â—†',
  },
  esmeralda: {
    isDark: true,
    bg: 'linear-gradient(180deg, #071a12 0%, #0c2618 50%, #071510 100%)',
    heroOverlay:
      'radial-gradient(circle at 30% 20%, rgba(40,105,72,0.28), transparent 55%), radial-gradient(circle at 75% 70%, rgba(70,158,106,0.15), transparent 50%)',
    accent: '#4dba7c',
    text: '#e0f5ea',
    textMuted: 'rgba(224,245,234,0.5)',
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(77,186,124,0.22)',
    divider: 'rgba(77,186,124,0.15)',
    rsvpBg: '#4dba7c',
    rsvpText: '#071510',
    ornament: 'âœ¿',
  },
  noir: {
    isDark: true,
    bg: 'linear-gradient(180deg, #080808 0%, #111111 50%, #080808 100%)',
    heroOverlay:
      'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.04), transparent 55%), radial-gradient(circle at 68% 72%, rgba(255,255,255,0.025), transparent 50%)',
    accent: '#d0d0d0',
    text: '#f0f0f0',
    textMuted: 'rgba(240,240,240,0.5)',
    glass: 'rgba(255,255,255,0.04)',
    glassBorder: 'rgba(255,255,255,0.1)',
    divider: 'rgba(255,255,255,0.09)',
    rsvpBg: '#e8e8e8',
    rsvpText: '#080808',
    ornament: 'â€”',
  },
  lavanda: {
    isDark: false,
    bg: 'linear-gradient(180deg, #f5f0ff 0%, #ece2fb 50%, #e0d0f5 100%)',
    heroOverlay:
      'radial-gradient(circle at 28% 22%, rgba(110,70,182,0.14), transparent 55%), radial-gradient(circle at 78% 65%, rgba(150,110,215,0.1), transparent 50%)',
    accent: '#7a50c8',
    text: '#28183c',
    textMuted: 'rgba(40,24,60,0.5)',
    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(122,80,200,0.18)',
    divider: 'rgba(122,80,200,0.14)',
    rsvpBg: 'rgba(122,80,200,0.1)',
    rsvpText: '#7a50c8',
    ornament: 'â€',
  },
  terracota: {
    isDark: false,
    bg: 'linear-gradient(180deg, #f5ede2 0%, #ecdbc8 50%, #e0c8b0 100%)',
    heroOverlay:
      'radial-gradient(circle at 32% 22%, rgba(172,76,46,0.13), transparent 55%), radial-gradient(circle at 72% 65%, rgba(192,112,72,0.09), transparent 50%)',
    accent: '#aa4b2d',
    text: '#2e1408',
    textMuted: 'rgba(46,20,8,0.5)',
    glass: 'rgba(255,248,238,0.62)',
    glassBorder: 'rgba(170,75,45,0.18)',
    divider: 'rgba(170,75,45,0.14)',
    rsvpBg: 'rgba(170,75,45,0.12)',
    rsvpText: '#aa4b2d',
    ornament: 'âˆž',
  },
}

// â”€â”€ Countdown helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ES_MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
}

function parseEventDate(raw: string): Date | null {
  if (!raw) return null
  // Try native parse (handles ISO 8601 and many other formats)
  const native = new Date(raw)
  if (!isNaN(native.getTime())) return native
  // Try DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (slashMatch) {
    const d = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]))
    if (!isNaN(d.getTime())) return d
  }
  // Try Spanish: "28 junio 2026" or "28 de junio de 2026"
  const parts = raw.toLowerCase().replace(/ de /g, ' ').split(/\s+/)
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10)
    const month = ES_MONTHS[parts[1]]
    const year = parseInt(parts[parts.length - 1], 10)
    if (day && month && year) return new Date(year, month - 1, day)
  }
  return null
}

function getCountdownUnits(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const total = Math.floor(diff / 1000)
  return [
    { label: 'DÃ­as',  value: Math.floor(total / 86400) },
    { label: 'Horas', value: Math.floor((total % 86400) / 3600) },
    { label: 'Min',   value: Math.floor((total % 3600) / 60) },
    { label: 'Seg',   value: total % 60 },
  ]
}

function HeroCountdown({ eventDate, s }: { eventDate: string; s: TemplateStyle }) {
  const target = useMemo(() => parseEventDate(eventDate), [eventDate])
  const [units, setUnits] = useState(() => (target ? getCountdownUnits(target) : null))

  useEffect(() => {
    if (!target || target.getTime() <= Date.now()) return
    setUnits(getCountdownUnits(target))
    const id = setInterval(() => setUnits(getCountdownUnits(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target || !units) return null

  if (target.getTime() <= Date.now()) {
    return (
      <p className="text-xs font-dm uppercase tracking-widest" style={{ color: s.accent }}>
        Â¡El evento es hoy!
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[0.55rem] uppercase tracking-[0.4em] font-dm" style={{ color: `${s.accent}88` }}>
        Cuenta regresiva
      </p>
      <div className="flex items-end gap-5 sm:gap-7">
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <span
              className="font-cormorant font-semibold tabular-nums leading-none"
              style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: s.accent }}
            >
              {String(u.value).padStart(2, '0')}
            </span>
            <span
              className="text-[0.48rem] uppercase tracking-widest font-dm mt-1.5"
              style={{ color: `${s.accent}66` }}
            >
              {u.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// â”€â”€ Scroll fade-in wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// â”€â”€ Shared UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Ornament({ s }: { s: TemplateStyle }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="h-px w-12 flex-none" style={{ background: s.accent, opacity: 0.28 }} />
      <span className="text-sm flex-none" style={{ color: s.accent, opacity: 0.5 }}>
        {s.ornament}
      </span>
      <div className="h-px w-12 flex-none" style={{ background: s.accent, opacity: 0.28 }} />
    </div>
  )
}

function SectionLabel({ children, s }: { children: string; s: TemplateStyle }) {
  return (
    <p className="text-[0.58rem] uppercase tracking-[0.42em] font-dm" style={{ color: s.accent }}>
      {children}
    </p>
  )
}

function SectionDivider({ s }: { s: TemplateStyle }) {
  return (
    <div className="py-10 flex items-center justify-center">
      <Ornament s={s} />
    </div>
  )
}

// â”€â”€ Music Player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MusicPlayer({ src, s }: { src: string; s: TemplateStyle }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false) // esperando gesto para activar sonido
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onTimeUpdate = () => {
      if (el.duration) setProgress(el.currentTime / el.duration)
    }
    const onEnded = () => setPlaying(false)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('ended', onEnded)

    const removeGestureListeners = (handler: () => void) => {
      document.removeEventListener('click', handler)
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('scroll', handler, true)
      document.removeEventListener('keydown', handler)
    }

    const enableSoundOnGesture = () => {
      el.muted = false
      setWaiting(false)
      el.play().then(() => { setPlaying(true) }).catch(() => {})
      removeGestureListeners(enableSoundOnGesture)
    }

    const addGestureListeners = () => {
      document.addEventListener('click', enableSoundOnGesture, { once: true })
      document.addEventListener('touchstart', enableSoundOnGesture, { once: true })
      document.addEventListener('scroll', enableSoundOnGesture, { once: true, capture: true })
      document.addEventListener('keydown', enableSoundOnGesture, { once: true })
    }

    const tryPlay = async (muted: boolean) => {
      el.muted = muted
      try {
        await el.play()
        setPlaying(true)
        setWaiting(muted)
        return true
      } catch {
        return false
      }
    }

    // Intentar autoplay con sonido. Si el navegador lo bloquea, iniciar en mute y
    // habilitar sonido con el primer gesto del usuario (scroll/click/tecla).
    void (async () => {
      if (await tryPlay(false)) return
      if (await tryPlay(true)) {
        addGestureListeners()
        return
      }
      addGestureListeners()
    })()

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('ended', onEnded)
      el.pause()
    }
  }, [src])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play().then(() => { setPlaying(true); setWaiting(false) }).catch(() => {})
    }
  }

  return (
    <div
      className="fixed bottom-6 right-5 z-50 flex items-center gap-2.5 rounded-full px-3 py-2 shadow-xl backdrop-blur-md"
      style={{
        background: s.isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)',
        border: `1px solid ${s.accent}44`,
      }}
    >
      <audio ref={audioRef} src={src} loop preload="auto" playsInline />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: s.accent, color: s.isDark ? '#0a0a0a' : '#fff' }}
        aria-label={playing ? 'Pausar música' : 'Reanudar música'}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="1" width="3" height="10" rx="1" />
          <rect x="7" y="1" width="3" height="10" rx="1" />
        </svg>
      </button>
      {/* Progress bar */}
      <svg width="8" height="28" className="opacity-60">
        <rect x="3" y="0" width="2" height="28" rx="1"
          style={{ fill: `${s.accent}33` }} />
        <rect x="3" y={28 - 28 * progress} width="2" height={28 * progress} rx="1"
          style={{ fill: s.accent }} />
      </svg>
      <span
        className="text-[0.52rem] uppercase tracking-[0.22em] font-dm leading-tight"
        style={{ color: s.accent, maxWidth: 64 }}
      >
        {waiting ? 'Activa sonido' : playing ? 'Sonando' : 'Música'}
      </span>
    </div>
  )
}
function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[]
  initialIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(initialIndex)
  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors flex items-center justify-center text-xl"
            onClick={e => { e.stopPropagation(); prev() }}
          >
            â€¹
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors flex items-center justify-center text-xl"
            onClick={e => { e.stopPropagation(); next() }}
          >
            â€º
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          onClick={e => e.stopPropagation()}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-5 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/35'}`}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// â”€â”€ Event card (Ceremony / Reception) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EventCard({
  label,
  venue,
  address,
  time,
  photo,
  mapUrl,
  s,
  embossPanel,
}: {
  label: string
  venue: string
  address?: string
  time?: string
  photo?: string
  mapUrl?: string
  s: TemplateStyle
  embossPanel: React.CSSProperties
}) {
  const resolvedMap =
    mapUrl ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null)

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: s.glass,
        border: `1px solid ${s.glassBorder}`,
        ...embossPanel,
      }}
    >
      {photo && (
        <div className="aspect-video overflow-hidden">
          <img src={photo} alt={venue} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="px-6 py-7 text-center space-y-2">
        <SectionLabel s={s}>{label}</SectionLabel>
        <h3 className="font-cormorant text-2xl sm:text-3xl leading-tight" style={{ color: s.text }}>
          {venue}
        </h3>
        {time && (
          <p className="text-sm font-dm font-medium" style={{ color: s.accent }}>
            {time}
          </p>
        )}
        {address && (
          <p className="text-xs font-dm leading-relaxed" style={{ color: s.textMuted }}>
            {address}
          </p>
        )}
        {resolvedMap && (
          <div className="pt-3">
            <a
              href={resolvedMap}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[0.6rem] uppercase tracking-[0.25em] font-dm transition-all hover:opacity-75 active:scale-95"
              style={{
                background: s.rsvpBg,
                color: s.rsvpText,
                border: `1px solid ${s.glassBorder}`,
              }}
            >
              <MapPin size={11} />
              Ver mapa
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€ RSVP href helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getRsvpHref(rsvpValue: string): string {
  const clean = rsvpValue.replace(/^WhatsApp:\s*/i, '').trim()
  if (/^https?:\/\//i.test(clean)) return clean
  const digits = clean.replace(/\D/g, '')
  if (/^\d{7,}$/.test(digits)) {
    return `https://wa.me/${digits}?text=${encodeURIComponent('Hola, confirmo mi asistencia.')}`
  }
  return `https://wa.me/?text=${encodeURIComponent(`RSVP: ${clean}`)}`
}

// â”€â”€ Layout constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PAD = 'px-7 sm:px-10'
const SECTION = `${PAD} py-16 sm:py-20`

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function InvitationStrip({
  invitation,
  shareUrl,
  guestName,
  guestMessage,
  guestTableNumber,
}: {
  invitation: ApiInvitation
  shareUrl: string
  guestName?: string
  guestMessage?: string
  guestTableNumber?: number | null
}) {
  const templateStr = String(invitation.template ?? 'warm')
  const hasEmboss = templateStr.endsWith('-emboss')
  const hasFoil   = templateStr.endsWith('-foil')
  const baseTemplateId = templateStr.replace(/-emboss$|-foil$/, '')
  const s = TEMPLATE_STYLES[baseTemplateId] ?? TEMPLATE_STYLES.warm

  const [copied, setCopied] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const embossText: React.CSSProperties = hasEmboss
    ? {
        textShadow: s.isDark
          ? '1px 1px 3px rgba(0,0,0,0.65), -0.5px -0.5px 2px rgba(255,255,255,0.1)'
          : '1px 1px 2.5px rgba(0,0,0,0.16), -0.5px -0.5px 1.5px rgba(255,255,255,0.75)',
      }
    : {}

  const embossPanel: React.CSSProperties = hasEmboss
    ? {
        boxShadow: s.isDark
          ? '4px 4px 10px rgba(0,0,0,0.55), -2px -2px 6px rgba(255,255,255,0.06)'
          : '4px 4px 10px rgba(0,0,0,0.1), -3px -3px 8px rgba(255,255,255,0.75)',
      }
    : {}

  const foilGradient = `linear-gradient(135deg, ${s.accent} 0%, ${
    s.isDark ? 'rgba(255,232,140,0.92)' : 'rgba(255,255,255,0.88)'
  } 38%, ${s.accent} 56%, ${
    s.isDark ? 'rgba(245,210,100,0.85)' : 'rgba(230,215,165,0.9)'
  } 78%, ${s.accent} 100%)`

  // Gallery
  const fallbackGallery = getDemoGalleryForTemplate(baseTemplateId)
  const normalizedGallery = useMemo(() => {
    const userPhotos = (invitation.gallery ?? []).map(resolveInvitationImageUrl).filter(Boolean)
    const source = userPhotos.length > 0 ? userPhotos : fallbackGallery.map(resolveInvitationImageUrl)
    return source.slice(0, 8)
  }, [invitation.gallery, invitation.template])

  const heroPhoto = useMemo(() => {
    const explicit = resolveInvitationImageUrl(invitation.heroImage)
    if (explicit) return explicit
    if (normalizedGallery.length > 0) return normalizedGallery[0]
    return resolveInvitationImageUrl(fallbackGallery[0])
  }, [invitation.heroImage, normalizedGallery, fallbackGallery])

  // Field shortcuts
  const { title, names, eventType, eventDate } = invitation
  const time           = invitation.eventTime || ''
  const venue          = invitation.venue || ''
  const locationNote   = invitation.locationNote || ''
  const message        = invitation.message || ''
  const quote          = invitation.quote || ''
  const hashtag        = invitation.hashtag || ''
  const dressCode      = invitation.dressCode || ''
  const rsvpLabel      = invitation.rsvpLabel || 'Confirmar asistencia'
  const rsvpValue      = invitation.rsvpValue || ''

  // New section fields
  const ceremonyVenue   = invitation.ceremonyVenue || ''
  const ceremonyAddress = invitation.ceremonyAddress || ''
  const ceremonyTime    = invitation.ceremonyTime || ''
  const ceremonyPhoto   = resolveInvitationImageUrl(invitation.ceremonyPhoto)
  const ceremonyMapUrl  = invitation.ceremonyMapUrl || ''
  const receptionVenue   = invitation.receptionVenue || ''
  const receptionAddress = invitation.receptionAddress || ''
  const receptionTime    = invitation.receptionTime || ''
  const receptionPhoto   = resolveInvitationImageUrl(invitation.receptionPhoto)
  const receptionMapUrl  = invitation.receptionMapUrl || ''
  const giftsInfo        = invitation.giftsInfo || ''
  const instagramHandle  = invitation.instagramHandle || ''

  const parsedParents = useMemo(() => {
    const raw = invitation.parentsInfo || ''
    if (!raw) return []
    try { return JSON.parse(raw) as string[] } catch { return raw.split('\n').filter(Boolean) }
  }, [invitation.parentsInfo])

  const parsedSponsors = useMemo(() => {
    const raw = invitation.sponsorsInfo || ''
    if (!raw) return []
    try { return JSON.parse(raw) as string[] } catch { return raw.split('\n').filter(Boolean) }
  }, [invitation.sponsorsInfo])

  // Music
  const backgroundMusicUrl = useMemo(
    () => resolveInvitationImageUrl(invitation.backgroundMusic || ''),
    [invitation.backgroundMusic]
  )

  // Layout flags
  const hasEventCards = !!(ceremonyVenue || receptionVenue)
  const showWhereWhen = !hasEventCards && !!(venue || time || eventDate)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Mira mi invitaciÃ³n: ${shareUrl}`)}`

  return (
    <div className="w-full text-sm leading-relaxed" style={{ background: s.bg, color: s.text }}>

      {/* â•â• 1. HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-7 py-20 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: s.heroOverlay }} />

        <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-xs mx-auto">
          {/* Top ornament */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Ornament s={s} />
          </motion.div>

          {/* Event type */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <SectionLabel s={s}>{eventType}</SectionLabel>
          </motion.div>

          {/* Main name â€” H1, most dominant element */}
          <motion.h1
            className={`font-cormorant font-light leading-[1.04] tracking-wide${hasFoil ? ' inv-foil-text' : ''}`}
            style={{
              fontSize: 'clamp(2.8rem, 13vw, 5.5rem)',
              ...(hasFoil
                ? { background: foilGradient }
                : { color: s.text, ...embossText }),
            }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {names}
          </motion.h1>

          {/* Subtitle / title */}
          <motion.p
            className="font-cormorant text-lg italic"
            style={{ color: s.accent }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
          >
            {title}
          </motion.p>

          {/* Date & venue */}
          <motion.div
            className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.38 }}
          >
            <p
              className="text-[0.62rem] uppercase tracking-[0.35em] font-dm"
              style={{ color: s.textMuted }}
            >
              {eventDate}{time ? ` Â· ${time}` : ''}
            </p>
            {(venue || locationNote) && (
              <p
                className="text-[0.58rem] uppercase tracking-[0.25em] font-dm"
                style={{ color: s.textMuted, opacity: 0.7 }}
              >
                {[venue, locationNote].filter(Boolean).join(' Â· ')}
              </p>
            )}
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.48 }}
            className="pt-2"
          >
            <HeroCountdown eventDate={eventDate} s={s} />
          </motion.div>

          {/* Bottom ornament */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.58 }}
          >
            <Ornament s={s} />
          </motion.div>
        </div>
      </section>

      {/* â•â• 2. FOTO PRINCIPAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {heroPhoto && (
        <FadeIn>
          <section className={`${PAD} pb-16`}>
            <div
              className="w-full overflow-hidden shadow-2xl"
              style={{
                borderRadius: '28px',
                border: `1px solid ${s.glassBorder}`,
                aspectRatio: '3 / 4',
              }}
            >
              <img src={heroPhoto} alt={names} className="w-full h-full object-cover" />
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 3. MENSAJE DE INVITACIÃ“N â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {(quote || message) && (
        <FadeIn>
          <section className={`${SECTION} text-center`}>
            <SectionLabel s={s}>Con mucho amor</SectionLabel>
            <div className="mt-8 space-y-7">
              {quote && (
                <blockquote
                  className="font-cormorant text-2xl sm:text-3xl italic leading-relaxed"
                  style={{ color: s.text, ...embossText }}
                >
                  "{quote}"
                </blockquote>
              )}
              {message && (
                <p
                  className="font-cormorant text-lg sm:text-xl leading-relaxed max-w-[280px] mx-auto"
                  style={{ color: s.text, opacity: 0.85 }}
                >
                  {message}
                </p>
              )}
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 4. DÃ“NDE Y CUÃNDO (fallback si no hay ceremony/reception split) â•â•â•â• */}
      {showWhereWhen && (
        <FadeIn>
          <section className={`${SECTION} text-center`}>
            <SectionLabel s={s}>DÃ³nde y cuÃ¡ndo</SectionLabel>
            <div className="mt-10 grid gap-10">
              {[
                { label: 'Fecha', value: eventDate },
                { label: 'Hora', value: time },
                { label: 'Lugar', value: venue, note: locationNote },
              ]
                .filter(item => item.value)
                .map(item => (
                  <div key={item.label}>
                    <p
                      className="text-[0.55rem] uppercase tracking-[0.38em] font-dm"
                      style={{ color: s.accent }}
                    >
                      {item.label}
                    </p>
                    <div className="h-px w-6 mx-auto my-2.5" style={{ background: s.divider }} />
                    <p className="font-cormorant text-2xl" style={{ color: s.text }}>
                      {item.value}
                    </p>
                    {item.note && (
                      <p className="text-xs mt-1 font-dm" style={{ color: s.textMuted }}>
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 5 & 6. CEREMONIA / RECEPCIÃ“N â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {hasEventCards && (
        <section className={`${SECTION}`}>
          <FadeIn>
            <div className="text-center mb-10">
              <SectionLabel s={s}>El gran dÃ­a</SectionLabel>
              <p className="font-cormorant text-lg mt-2" style={{ color: s.textMuted }}>
                {eventDate}{time ? ` Â· ${time}` : ''}
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-6">
            {ceremonyVenue && (
              <FadeIn delay={0.08}>
                <EventCard
                  label="Ceremonia"
                  venue={ceremonyVenue}
                  address={ceremonyAddress}
                  time={ceremonyTime}
                  photo={ceremonyPhoto}
                  mapUrl={ceremonyMapUrl}
                  s={s}
                  embossPanel={embossPanel}
                />
              </FadeIn>
            )}
            {receptionVenue && (
              <FadeIn delay={0.18}>
                <EventCard
                  label="RecepciÃ³n"
                  venue={receptionVenue}
                  address={receptionAddress}
                  time={receptionTime}
                  photo={receptionPhoto}
                  mapUrl={receptionMapUrl}
                  s={s}
                  embossPanel={embossPanel}
                />
              </FadeIn>
            )}
          </div>
        </section>
      )}

      {/* â•â• 7. CÃ“DIGO DE VESTIMENTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {dressCode && (
        <FadeIn>
          <section className={`${SECTION} text-center`}>
            <div
              className="px-7 py-9 rounded-3xl"
              style={{
                background: s.glass,
                border: `1px solid ${s.glassBorder}`,
                ...embossPanel,
              }}
            >
              <SectionLabel s={s}>CÃ³digo de vestimenta</SectionLabel>
              <div className="h-px w-6 mx-auto my-3" style={{ background: s.divider }} />
              <p className="font-cormorant text-2xl mt-1" style={{ color: s.text }}>
                {dressCode}
              </p>
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 8. GALERÃA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {normalizedGallery.length > 0 && (
        <FadeIn>
          <section className={`${SECTION}`}>
            <div className="text-center mb-9">
              <SectionLabel s={s}>GalerÃ­a</SectionLabel>
              <p className="font-cormorant text-lg mt-2" style={{ color: s.textMuted }}>
                Momentos especiales
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {normalizedGallery.map((url, idx) => (
                <motion.button
                  key={`gallery-${idx}`}
                  className="overflow-hidden w-full block focus:outline-none"
                  style={{
                    borderRadius: s.isDark ? '10px' : '18px',
                    border: `1px solid ${s.divider}`,
                    aspectRatio: idx % 3 === 0 ? '3 / 4' : '1 / 1',
                  }}
                  onClick={() => setLightboxIndex(idx)}
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.975 }}
                  transition={{ duration: 0.18 }}
                >
                  <img
                    src={url}
                    alt={`GalerÃ­a ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.button>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={normalizedGallery}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* â•â• 9. PADRES Y PADRINOS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {(parsedParents.length > 0 || parsedSponsors.length > 0) && (
        <FadeIn>
          <section className={`${SECTION} text-center`}>
            <SectionDivider s={s} />
            {parsedParents.length > 0 && (
              <div className="mb-12">
                <SectionLabel s={s}>PapÃ¡s</SectionLabel>
                <div className="mt-6 space-y-2">
                  {parsedParents.map((name, i) => (
                    <p key={i} className="font-cormorant text-xl leading-snug" style={{ color: s.text }}>
                      {name}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {parsedSponsors.length > 0 && (
              <div>
                <SectionLabel s={s}>Padrinos</SectionLabel>
                <div className="mt-6 space-y-2">
                  {parsedSponsors.map((name, i) => (
                    <p key={i} className="font-cormorant text-xl leading-snug" style={{ color: s.text }}>
                      {name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        </FadeIn>
      )}

      {/* â•â• 10. REGALOS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {giftsInfo && (
        <FadeIn>
          <section className={`${SECTION}`}>
            <div
              className="px-7 py-9 rounded-3xl text-center"
              style={{ background: s.glass, border: `1px solid ${s.glassBorder}` }}
            >
              <div className="flex justify-center mb-4">
                <Gift size={22} style={{ color: s.accent, opacity: 0.75 }} />
              </div>
              <SectionLabel s={s}>Mesa de regalos</SectionLabel>
              <div className="h-px w-6 mx-auto my-3" style={{ background: s.divider }} />
              <p
                className="font-cormorant text-lg leading-relaxed whitespace-pre-line"
                style={{ color: s.text }}
              >
                {giftsInfo}
              </p>
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 11. INSTAGRAM â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {(instagramHandle || hashtag) && (
        <FadeIn>
          <section className={`${SECTION} text-center`}>
            <SectionLabel s={s}>Comparte tu experiencia</SectionLabel>
            <div className="mt-7 flex flex-col items-center gap-3">
              {instagramHandle && (
                <a
                  href={`https://instagram.com/${instagramHandle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-dm transition-opacity hover:opacity-65"
                  style={{ color: s.accent }}
                >
                  <Instagram size={17} />
                  {instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`}
                </a>
              )}
              {hashtag && (
                <p className="text-sm font-dm" style={{ color: s.textMuted }}>
                  {hashtag}
                </p>
              )}
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 12. CONFIRMACIÃ“N DE ASISTENCIA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {rsvpValue && (
        <FadeIn>
          <section className={`${SECTION} text-center`}>
            <SectionLabel s={s}>{rsvpLabel}</SectionLabel>
            <p className="font-cormorant text-xl mt-3 mb-8" style={{ color: s.text }}>
              {rsvpValue}
            </p>
            <a
              href={getRsvpHref(rsvpValue)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-[0.62rem] uppercase tracking-[0.3em] font-dm transition-all hover:opacity-75 active:scale-95"
              style={{ background: s.rsvpBg, color: s.rsvpText }}
            >
              <MessageCircle size={13} />
              Confirmar asistencia
            </a>
          </section>
        </FadeIn>
      )}

      {/* â•â• 13. MENSAJE PERSONALIZADO AL INVITADO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {guestName && (
        <FadeIn>
          <section className={`${SECTION}`}>
            <div
              className="px-7 py-10 rounded-3xl text-center"
              style={{
                background: s.glass,
                border: `1px solid ${s.glassBorder}`,
                ...embossPanel,
              }}
            >
              <SectionLabel s={s}>Esta invitaciÃ³n es para ti</SectionLabel>
              <p
                className="font-cormorant italic mt-3 mb-1"
                style={{ fontSize: '1.1rem', color: s.textMuted }}
              >
                {invitation.guestGreeting || 'Con mucho cariÃ±o te invitamos'},
              </p>
              <p
                className={`font-cormorant leading-snug mt-2${hasFoil ? ' inv-foil-text' : ''}`}
                style={{
                  fontSize: 'clamp(2.2rem, 9vw, 3rem)',
                  ...(hasFoil ? { background: foilGradient } : { color: s.accent, ...embossText }),
                }}
              >
                {guestName}
              </p>
              {guestMessage && (
                <>
                  <div className="my-6">
                    <Ornament s={s} />
                  </div>
                  <p
                    className="text-base font-cormorant italic leading-relaxed"
                    style={{ color: s.text, opacity: 0.82 }}
                  >
                    {guestMessage}
                  </p>
                </>
              )}

              {invitation.enableTableNumber && guestTableNumber != null && (
                <>
                  <div className="my-6">
                    <Ornament s={s} />
                  </div>
                  <p
                    className="text-[0.58rem] uppercase tracking-[0.38em] font-dm"
                    style={{ color: s.accent }}
                  >
                    Tu mesa
                  </p>
                  <p
                    className="font-cormorant font-light leading-none mt-2"
                    style={{ fontSize: 'clamp(3rem, 14vw, 5rem)', color: s.accent }}
                  >
                    {guestTableNumber}
                  </p>
                </>
              )}
            </div>
          </section>
        </FadeIn>
      )}

      {/* â•â• 14. CIERRE / COMPARTIR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <FadeIn>
        <section className={`${PAD} pt-8 pb-20 text-center`}>
          <SectionDivider s={s} />
          <SectionLabel s={s}>Compartir invitaciÃ³n</SectionLabel>

          {/* QR code */}
          <div
            className="mt-7 mx-auto w-36 h-36 grid place-items-center rounded-2xl shadow-lg"
            style={{
              background: s.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${s.glassBorder}`,
            }}
          >
            <QrCodeImage value={shareUrl} size={100} className="w-24 h-24" />
          </div>

          {/* Share buttons */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.58rem] uppercase tracking-[0.22em] font-dm transition-all active:scale-95"
              style={{
                background: s.glass,
                border: `1px solid ${s.glassBorder}`,
                color: copied ? s.accent : s.textMuted,
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a
              href={whatsappShare}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.58rem] uppercase tracking-[0.22em] font-dm transition-all hover:opacity-75 active:scale-95"
              style={{
                background: s.glass,
                border: `1px solid ${s.glassBorder}`,
                color: s.textMuted,
              }}
            >
              <MessageCircle size={11} />
              WhatsApp
            </a>
          </div>

          {/* Branding */}
          <div className="mt-14 pt-6" style={{ borderTop: `1px solid ${s.divider}` }}>
            <p
              className="text-[0.48rem] uppercase tracking-[0.32em]"
              style={{ color: s.textMuted, opacity: 0.38 }}
            >
              InvitaciÃ³n creada por Pedro Vargas FotografÃ­a
            </p>
          </div>
        </section>
      </FadeIn>

      {/* â•â• FLOATING MUSIC PLAYER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {backgroundMusicUrl && <MusicPlayer src={backgroundMusicUrl} s={s} />}
    </div>
  )
}

