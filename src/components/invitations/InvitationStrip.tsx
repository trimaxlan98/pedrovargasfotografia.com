import { useMemo, useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import {
  ApiInvitation,
  getDemoGalleryForTemplate,
  resolveInvitationImageUrl,
} from './invitationTypes'
import QrCodeImage from './QrCodeImage'

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
    ornament: '✦',
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
    ornament: '◆',
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
    ornament: '✿',
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
    ornament: '—',
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
    ornament: '❀',
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
    ornament: '∞',
  },
}

const PAD = 'px-7 sm:px-10'

function Ornament({ s }: { s: TemplateStyle }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-10 flex-none" style={{ background: s.accent, opacity: 0.35 }} />
      <span className="text-xs flex-none" style={{ color: s.accent, opacity: 0.65 }}>
        {s.ornament}
      </span>
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

function getRsvpHref(rsvpValue: string): string {
  const clean = rsvpValue.replace(/^WhatsApp:\s*/i, '').trim()
  if (/^https?:\/\//i.test(clean)) return clean

  const digits = clean.replace(/\D/g, '')
  if (/^\d{7,}$/.test(digits)) {
    return `https://wa.me/${digits}?text=${encodeURIComponent('Hola, confirmo mi asistencia.')}`
  }

  return `https://wa.me/?text=${encodeURIComponent(`RSVP: ${clean}`)}`
}

export default function InvitationStrip({
  invitation,
  shareUrl,
  guestName,
  guestMessage,
}: {
  invitation: ApiInvitation
  shareUrl: string
  guestName?: string
  guestMessage?: string
}) {
  const templateStr = String(invitation.template ?? 'warm')
  const hasEmboss = templateStr.endsWith('-emboss')
  const hasFoil   = templateStr.endsWith('-foil')
  const baseTemplateId = templateStr.replace(/-emboss$|-foil$/, '')
  const s = TEMPLATE_STYLES[baseTemplateId] ?? TEMPLATE_STYLES.warm
  const [copied, setCopied] = useState(false)

  // Relief effect helpers
  const embossText = hasEmboss
    ? { textShadow: s.isDark
        ? '1px 1px 3px rgba(0,0,0,0.65), -0.5px -0.5px 2px rgba(255,255,255,0.1)'
        : '1px 1px 2.5px rgba(0,0,0,0.16), -0.5px -0.5px 1.5px rgba(255,255,255,0.75)' }
    : {}
  const embossPanel = hasEmboss
    ? { boxShadow: s.isDark
        ? '4px 4px 10px rgba(0,0,0,0.55), -2px -2px 6px rgba(255,255,255,0.06)'
        : '4px 4px 10px rgba(0,0,0,0.1), -3px -3px 8px rgba(255,255,255,0.75)' }
    : {}
  const foilGradient = `linear-gradient(135deg, ${s.accent} 0%, ${s.isDark ? 'rgba(255,232,140,0.92)' : 'rgba(255,255,255,0.88)'} 38%, ${s.accent} 56%, ${s.isDark ? 'rgba(245,210,100,0.85)' : 'rgba(230,215,165,0.9)'} 78%, ${s.accent} 100%)`

  const fallbackGallery = getDemoGalleryForTemplate(baseTemplateId)

  const normalizedGallery = useMemo(() => {
    const source = invitation.gallery && invitation.gallery.length > 0 ? invitation.gallery : fallbackGallery
    const resolved = source
      .map(resolveInvitationImageUrl)
      .filter(Boolean)

    if (resolved.length >= 4) return resolved.slice(0, 8)

    const fallbackResolved = fallbackGallery.map(resolveInvitationImageUrl)
    const unique = [...resolved]
    fallbackResolved.forEach(url => {
      if (unique.length < 8 && !unique.includes(url)) unique.push(url)
    })
    return unique
  }, [invitation.gallery, invitation.template])

  const heroPhoto = useMemo(() => {
    const explicit = resolveInvitationImageUrl(invitation.heroImage)
    if (explicit) return explicit
    if (normalizedGallery.length > 0) return normalizedGallery[0]
    return resolveInvitationImageUrl(fallbackGallery[0])
  }, [invitation.heroImage, normalizedGallery, fallbackGallery])

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

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Mira mi invitación digital: ${shareUrl}`)}`

  return (
    <div className="w-full text-sm leading-relaxed" style={{ background: s.bg, color: s.text }}>
      <section className={`min-h-[90vh] ${PAD} pt-14 pb-12 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: s.heroOverlay }} />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8">
            <Ornament s={s} />
          </div>

          <SectionLabel s={s}>{eventType}</SectionLabel>

          <h1
            className={`font-cormorant text-4xl sm:text-5xl leading-tight mt-4 mb-8${hasFoil ? ' inv-foil-text' : ''}`}
            style={hasFoil
              ? { background: foilGradient }
              : { color: s.text, ...embossText }
            }
          >
            {title}
          </h1>

          <div
            className="w-40 h-56 sm:w-48 sm:h-64 rounded-[999px] overflow-hidden shadow-2xl"
            style={{ border: `1px solid ${s.accent}28` }}
          >
            {heroPhoto ? (
              <img src={heroPhoto} alt={names} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #2b2017 0%, #3d2b1d 100%)' }} />
            )}
          </div>

          <p className="mt-6 text-2xl font-cormorant tracking-wide" style={{ color: s.text, ...embossText }}>
            {names}
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] mt-2" style={{ color: s.accent }}>
            {date}
            {time ? ` · ${time}` : ''}
          </p>

          <div className="mt-8">
            <Ornament s={s} />
          </div>
        </div>
      </section>

      {/* ── Sección personalizada por invitado ── */}
      {guestName && (
        <section className={`${PAD} py-10 text-center`}>
          <div
            className="px-6 py-8 rounded-[20px]"
            style={{
              background: s.glass,
              border: `1px solid ${s.glassBorder}`,
              ...(hasEmboss ? embossPanel : {}),
            }}
          >
            <SectionLabel s={s}>Esta invitación es para ti</SectionLabel>
            <ThinDivider s={s} />
            <p
              className={`font-cormorant text-3xl sm:text-4xl mt-5 leading-snug${hasFoil ? ' inv-foil-text' : ''}`}
              style={hasFoil ? { background: foilGradient } : { color: s.text, ...embossText }}
            >
              {invitation.guestGreeting || 'Con cariño te invitamos'},
            </p>
            <p
              className="font-cormorant text-3xl sm:text-4xl mt-1 leading-snug"
              style={{ color: s.accent, ...embossText }}
            >
              {guestName}
            </p>
            {guestMessage && (
              <>
                <div className="mt-5 mb-4">
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
          </div>
        </section>
      )}

      {quote ? (
        <section className={`${PAD} py-12`}>
          <div
            className="px-6 py-8 text-center"
            style={{
              background: s.glass,
              border: `1px solid ${s.glassBorder}`,
              boxShadow: hasEmboss
                ? embossPanel.boxShadow
                : s.isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.05)',
            }}
          >
            <p className="text-base font-cormorant italic leading-relaxed" style={{ color: s.text, ...embossText }}>
              "{quote}"
            </p>
          </div>
        </section>
      ) : null}

      {message ? (
        <section className={`${PAD} pb-12 text-center`}>
          <SectionLabel s={s}>Con mucho amor</SectionLabel>
          <ThinDivider s={s} />
          <p className="mt-5 text-base font-cormorant leading-relaxed" style={{ color: s.text, opacity: 0.85 }}>
            {message}
          </p>
        </section>
      ) : null}

      <section className={`${PAD} pb-12`}>
        <div className="grid gap-8">
          {[
            { label: 'Fecha', value: date },
            { label: 'Hora', value: time },
            { label: 'Lugar', value: venue, note: locationNote },
          ]
            .filter(item => item.value)
            .map(item => (
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

      <section className={`${PAD} pb-12`}>
        <div className="text-center mb-6">
          <SectionLabel s={s}>Nuestra historia</SectionLabel>
          <p className="font-cormorant text-lg mt-2" style={{ color: s.text }}>
            Un vistazo a nuestro camino juntos
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {normalizedGallery.map((url, idx) => (
            <div
              key={`gallery-${idx}`}
              className={`overflow-hidden ${idx % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
              style={{
                borderRadius: s.isDark ? '4px' : '18px',
                border: `1px solid ${s.divider}`,
              }}
            >
              <img src={url} alt={`Galería ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {dressCode ? (
        <section className={`${PAD} pb-12`}>
          <div className="px-6 py-6 text-center" style={{ background: s.glass, border: `1px solid ${s.glassBorder}` }}>
            <SectionLabel s={s}>Código de vestimenta</SectionLabel>
            <p className="font-cormorant text-lg mt-3" style={{ color: s.text }}>
              {dressCode}
            </p>
          </div>
        </section>
      ) : null}

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
            style={{ background: s.rsvpBg, color: s.rsvpText, border: `1px solid ${s.glassBorder}` }}
          >
            <MessageCircle size={13} />
            Confirmar asistencia
          </a>
        </section>
      ) : null}

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

        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${s.divider}` }}>
          <p className="text-[0.5rem] uppercase tracking-[0.3em]" style={{ color: s.textMuted, opacity: 0.45 }}>
            Invitación creada por Pedro Vargas Fotografía
          </p>
        </div>
      </section>
    </div>
  )
}

