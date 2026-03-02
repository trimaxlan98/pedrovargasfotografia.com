import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { ApiInvitation } from './invitationTypes'
import QrCodeImage from './QrCodeImage'

/* ── Template Design System ──────────────────────────────────────────────── */
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
  heroPhoto: string
  galleryA: string
  galleryB: string
  ornament: string
}

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  /* ── Warm — cremas suaves, dorado miel ─────────────────────────────── */
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
    heroPhoto: 'photo-placeholder-amber',
    galleryA: 'photo-placeholder-amber',
    galleryB: 'photo-placeholder-warm',
    ornament: '✦',
  },

  /* ── Floral — rosa polvoso, romanticismo ───────────────────────────── */
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
    heroPhoto: 'photo-placeholder-rose',
    galleryA: 'photo-placeholder-rose',
    galleryB: 'photo-placeholder-warm',
    ornament: '❀',
  },

  /* ── Rustic — tierra oscura, detalles dorados ──────────────────────── */
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
    heroPhoto: 'photo-placeholder-amber',
    galleryA: 'photo-placeholder-neutral',
    galleryB: 'photo-placeholder-amber',
    ornament: '◆',
  },

  /* ── Moderno — navy elegante, líneas limpias ───────────────────────── */
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
    heroPhoto: 'photo-placeholder-cool',
    galleryA: 'photo-placeholder-cool',
    galleryB: 'photo-placeholder-neutral',
    ornament: '◈',
  },
}

const PAD = 'px-7 sm:px-10'

function Ornament({ s }: { s: TemplateStyle }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-10 flex-none" style={{ background: s.accent, opacity: 0.35 }} />
      <span className="text-xs flex-none" style={{ color: s.accent, opacity: 0.65 }}>{s.ornament}</span>
      <div className="h-px w-10 flex-none" style={{ background: s.accent, opacity: 0.35 }} />
    </div>
  )
}

function SectionLabel({ children, s }: { children: string; s: TemplateStyle }) {
  return (
    <p className="text-[0.6rem] uppercase tracking-[0.38em]" style={{ color: s.accent }}>
      {children}
    </p>
  )
}

function ThinDivider({ s }: { s: TemplateStyle }) {
  return <div className="h-px w-8 mx-auto" style={{ background: s.divider }} />
}

/* ── RSVP action resolver ────────────────────────────────────────────────── */
function getRsvpHref(rsvpValue: string): string {
  const clean = rsvpValue.replace(/^WhatsApp:\s*/i, '').trim()
  // Is a URL?
  if (/^https?:\/\//i.test(clean)) return clean
  // Is a phone number?
  const digits = clean.replace(/[\s\-().+]/g, '')
  if (/^\d{7,}$/.test(digits)) {
    return `https://wa.me/${digits}?text=${encodeURIComponent('¡Hola! Confirmo mi asistencia.')}`
  }
  // Try WhatsApp with whatever they typed
  return `https://wa.me/?text=${encodeURIComponent(`RSVP: ${clean}`)}`
}

/* ── Main Strip ──────────────────────────────────────────────────────────── */
export default function InvitationStrip({
  invitation,
  shareUrl,
}: {
  invitation: ApiInvitation
  shareUrl: string
}) {
  const s = TEMPLATE_STYLES[invitation.template] ?? TEMPLATE_STYLES.warm

  const [copied, setCopied] = useState(false)

  const title = invitation.title
  const names = invitation.names
  const eventType = invitation.eventType
  const date = invitation.eventDate
  const time = invitation.eventTime || ''
  const venue = invitation.venue || ''
  const locationNote = invitation.locationNote || ''
  const message = invitation.message || ''
  const quote = invitation.quote || ''
  const hashtag = invitation.hashtag || ''
  const dressCode = invitation.dressCode || ''
  const rsvpLabel = invitation.rsvpLabel || 'Confirmar asistencia'
  const rsvpValue = invitation.rsvpValue || ''
  const gallery = invitation.gallery || []
  const placeholderCount = gallery.length === 0 ? 4 : 0

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(
    `¡Mira mi invitación digital! ${shareUrl}`
  )}`

  return (
    <div className="w-full text-sm leading-relaxed" style={{ background: s.bg, color: s.text }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={`min-h-[90vh] ${PAD} pt-14 pb-12 text-center relative overflow-hidden`}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: s.heroOverlay }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8">
            <Ornament s={s} />
          </div>

          <SectionLabel s={s}>{eventType}</SectionLabel>

          <h1
            className="font-cormorant text-4xl sm:text-5xl leading-tight mt-4 mb-8"
            style={{ color: s.text }}
          >
            {title}
          </h1>

          {/* Couple photo */}
          <div
            className="w-40 h-56 sm:w-48 sm:h-64 rounded-[999px] overflow-hidden shadow-2xl"
            style={{ border: `1px solid ${s.accent}28` }}
          >
            <div className={`w-full h-full ${s.heroPhoto}`} />
          </div>

          <p className="mt-6 text-2xl font-cormorant tracking-wide" style={{ color: s.text }}>
            {names}
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] mt-2" style={{ color: s.accent }}>
            {date}{time ? ` · ${time}` : ''}
          </p>

          <div className="mt-8">
            <Ornament s={s} />
          </div>
        </div>
      </section>

      {/* ── Quote ────────────────────────────────────────────────────────── */}
      {quote ? (
        <section className={`${PAD} py-12`}>
          <div
            className="px-6 py-8 text-center"
            style={{
              background: s.glass,
              border: `1px solid ${s.glassBorder}`,
              boxShadow: s.isDark
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.05)',
            }}
          >
            <p className="text-base font-cormorant italic leading-relaxed" style={{ color: s.text }}>
              "{quote}"
            </p>
          </div>
        </section>
      ) : null}

      {/* ── Personal Message ─────────────────────────────────────────────── */}
      {message ? (
        <section className={`${PAD} pb-12 text-center`}>
          <SectionLabel s={s}>Con mucho amor</SectionLabel>
          <ThinDivider s={s} />
          <p
            className="mt-5 text-base font-cormorant leading-relaxed"
            style={{ color: s.text, opacity: 0.85 }}
          >
            {message}
          </p>
        </section>
      ) : null}

      {/* ── Event Details ─────────────────────────────────────────────────── */}
      <section className={`${PAD} pb-12`}>
        <div className="grid gap-8">
          {[
            { label: 'Fecha', value: date },
            { label: 'Hora', value: time },
            { label: 'Lugar', value: venue, note: locationNote },
          ].filter(item => item.value).map(item => (
            <div key={item.label} className="text-center">
              <SectionLabel s={s}>{item.label}</SectionLabel>
              <ThinDivider s={s} />
              <p className="font-cormorant text-xl mt-3" style={{ color: s.text }}>
                {item.value}
              </p>
              {item.note ? (
                <p className="text-xs mt-1" style={{ color: s.textMuted }}>
                  {item.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────────── */}
      <section className={`${PAD} pb-12`}>
        <div className="text-center mb-6">
          <SectionLabel s={s}>Nuestra historia</SectionLabel>
          <p className="font-cormorant text-lg mt-2" style={{ color: s.text }}>
            Un vistazo a nuestro camino
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {gallery.length > 0
            ? gallery.map((url, idx) => (
                <div
                  key={`gallery-${idx}`}
                  className={`overflow-hidden ${idx % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
                  style={{
                    borderRadius: s.isDark ? '4px' : '18px',
                    border: `1px solid ${s.divider}`,
                  }}
                >
                  <img src={url} alt="Galería" className="w-full h-full object-cover" />
                </div>
              ))
            : Array.from({ length: placeholderCount }).map((_, idx) => (
                <div
                  key={`ph-${idx}`}
                  className={`overflow-hidden shadow-lg ${idx % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
                  style={{
                    borderRadius: s.isDark ? '4px' : '18px',
                    border: `1px solid ${s.divider}`,
                  }}
                >
                  <div className={`w-full h-full ${idx % 2 === 0 ? s.galleryA : s.galleryB}`} />
                </div>
              ))}
        </div>
      </section>

      {/* ── Dress Code ───────────────────────────────────────────────────── */}
      {dressCode ? (
        <section className={`${PAD} pb-12`}>
          <div
            className="px-6 py-6 text-center"
            style={{ background: s.glass, border: `1px solid ${s.glassBorder}` }}
          >
            <SectionLabel s={s}>Código de Vestimenta</SectionLabel>
            <p className="font-cormorant text-lg mt-3" style={{ color: s.text }}>
              {dressCode}
            </p>
          </div>
        </section>
      ) : null}

      {/* ── RSVP ─────────────────────────────────────────────────────────── */}
      {rsvpValue ? (
        <section className={`${PAD} pb-12 text-center`}>
          <SectionLabel s={s}>{rsvpLabel}</SectionLabel>
          <p className="font-cormorant text-lg mb-6 mt-2" style={{ color: s.text }}>
            {rsvpValue}
          </p>
          <a
            href={getRsvpHref(rsvpValue)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 text-[0.65rem] uppercase tracking-[0.25em] font-dm transition-opacity duration-200 hover:opacity-80"
            style={{
              background: s.rsvpBg,
              color: s.rsvpText,
              border: `1px solid ${s.glassBorder}`,
            }}
          >
            <MessageCircle size={13} />
            Confirmar asistencia
          </a>
        </section>
      ) : null}

      {/* ── QR / Share ───────────────────────────────────────────────────── */}
      <section className={`${PAD} pb-16 text-center`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ background: s.divider }} />
          <span className="text-[0.55rem] uppercase tracking-[0.3em]" style={{ color: s.accent, opacity: 0.5 }}>
            Compartir
          </span>
          <div className="flex-1 h-px" style={{ background: s.divider }} />
        </div>

        <SectionLabel s={s}>Comparte esta invitación</SectionLabel>

        <div
          className="mt-6 mx-auto w-32 h-32 grid place-items-center shadow-xl"
          style={{
            background: s.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.85)',
            border: `1px solid ${s.glassBorder}`,
          }}
        >
          <QrCodeImage value={shareUrl} size={96} className="w-24 h-24" />
        </div>

        {hashtag ? (
          <p className="mt-5 text-[0.6rem] uppercase tracking-[0.25em]" style={{ color: s.textMuted }}>
            {hashtag}
          </p>
        ) : null}

        {/* Share action buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-[0.6rem] uppercase tracking-[0.2em] font-dm transition-all duration-200"
            style={{
              background: s.glass,
              border: `1px solid ${s.glassBorder}`,
              color: copied ? s.accent : s.textMuted,
            }}
            title="Copiar enlace"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copiado' : 'Copiar enlace'}
          </button>

          <a
            href={whatsappShare}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-[0.6rem] uppercase tracking-[0.2em] font-dm transition-all duration-200 hover:opacity-80"
            style={{
              background: s.glass,
              border: `1px solid ${s.glassBorder}`,
              color: s.textMuted,
            }}
            title="Compartir por WhatsApp"
          >
            <MessageCircle size={12} />
            WhatsApp
          </a>
        </div>

        {/* Studio watermark */}
        <div
          className="mt-10 pt-6"
          style={{ borderTop: `1px solid ${s.divider}` }}
        >
          <p
            className="text-[0.5rem] uppercase tracking-[0.3em]"
            style={{ color: s.textMuted, opacity: 0.45 }}
          >
            Invitación creada por Pedro Vargas Fotografía
          </p>
        </div>
      </section>
    </div>
  )
}
