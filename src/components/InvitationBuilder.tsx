import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from './useInView'
import { Download, MessageCircle, Link, ChevronDown, ArrowRight, Save, Check, ExternalLink, LogIn, Images } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

type Tab = 'estilo' | 'texto' | 'colores'
type Template = 'warm' | 'moderno' | 'floral' | 'rustic' | 'vintage' | 'pearl' | 'esmeralda' | 'noir'
type ReliefEffect = 'none' | 'emboss' | 'foil'
type EventType = 'Boda' | 'XV Años' | 'Cumpleaños' | 'Bautizo' | 'Graduación' | 'Corporativo'
type PrimaryColor = 'navy' | 'black' | 'gold' | 'rose' | 'emerald' | 'burgundy'
type TextColor = 'ivory' | 'white' | 'black'
type FontStyle = 'serif' | 'sans' | 'script'

interface InviteData {
  eventType: EventType
  name: string
  date: string
  time: string
  venue: string
  message: string
  dresscode: string
  showDresscode: boolean
  rsvp: string
  showRsvp: boolean
}

const templates: {
  id: Template
  label: string
  desc: string
  darkGradient: string
  lightGradient: string
}[] = [
  {
    id: 'warm',
    label: 'Cálida',
    desc: 'Cremas suaves, dorado miel',
    darkGradient: 'linear-gradient(135deg, #3d2810 0%, #5a3a18 50%, #2d1c0a 100%)',
    lightGradient: 'linear-gradient(135deg, #fdf6ee 0%, #f0e0c8 50%, #e8d5b8 100%)',
  },
  {
    id: 'floral',
    label: 'Floral',
    desc: 'Rosa polvoso, romántico',
    darkGradient: 'linear-gradient(135deg, #3d1a28 0%, #5a2538 50%, #2d1020 100%)',
    lightGradient: 'linear-gradient(135deg, #fdf0f4 0%, #f4d8e8 50%, #ecc8dc 100%)',
  },
  {
    id: 'rustic',
    label: 'Rústica',
    desc: 'Tierra oscura, detalles dorados',
    darkGradient: 'linear-gradient(135deg, #1e1008 0%, #2d1a0a 50%, #1e1208 100%)',
    lightGradient: 'linear-gradient(135deg, #f0e6d8 0%, #e0d0bc 50%, #d0bca0 100%)',
  },
  {
    id: 'moderno',
    label: 'Moderno',
    desc: 'Navy elegante, minimalista',
    darkGradient: 'linear-gradient(135deg, #08101e 0%, #0f1a30 50%, #08101e 100%)',
    lightGradient: 'linear-gradient(135deg, #e8edf8 0%, #d0dcf0 50%, #c0cce8 100%)',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    desc: 'Papel envejecido, sepia',
    darkGradient: 'linear-gradient(135deg, #2a1a08 0%, #3d2a10 50%, #2a1a08 100%)',
    lightGradient: 'linear-gradient(135deg, #f3e8d5 0%, #e8d5bc 50%, #dcc4a4 100%)',
  },
  {
    id: 'pearl',
    label: 'Perla',
    desc: 'Plata suave, lujo moderno',
    darkGradient: 'linear-gradient(135deg, #1a1a2e 0%, #252540 50%, #1a1a2e 100%)',
    lightGradient: 'linear-gradient(135deg, #fafafa 0%, #f2f2f8 50%, #e8e8f2 100%)',
  },
  {
    id: 'esmeralda',
    label: 'Esmeralda',
    desc: 'Verde profundo, botánico',
    darkGradient: 'linear-gradient(135deg, #071a12 0%, #0d2618 50%, #071510 100%)',
    lightGradient: 'linear-gradient(135deg, #e8f5ed 0%, #d5eddf 50%, #c0e0ce 100%)',
  },
  {
    id: 'noir',
    label: 'Noir',
    desc: 'Blanco y negro editorial',
    darkGradient: 'linear-gradient(135deg, #080808 0%, #111111 50%, #080808 100%)',
    lightGradient: 'linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 50%, #e8e8e8 100%)',
  },
]

const colorSwatches: { id: PrimaryColor; hex: string; label: string }[] = [
  { id: 'navy', hex: '#1B2A4A', label: 'Navy' },
  { id: 'black', hex: '#111111', label: 'Negro' },
  { id: 'gold', hex: '#C9A96E', label: 'Dorado' },
  { id: 'rose', hex: '#C47B8A', label: 'Rosa' },
  { id: 'emerald', hex: '#2D6A4F', label: 'Esmeralda' },
  { id: 'burgundy', hex: '#6D2B3D', label: 'Borgoña' },
]

const primaryColorHex: Record<PrimaryColor, string> = {
  navy: '#1B2A4A',
  black: '#111111',
  gold: '#C9A96E',
  rose: '#C47B8A',
  emerald: '#2D6A4F',
  burgundy: '#6D2B3D',
}

const textColorHex: Record<TextColor, string> = {
  ivory: '#F5F0E8',
  white: '#FFFFFF',
  black: '#111111',
}

const fontMap: Record<FontStyle, string> = {
  serif: '"Cormorant Garamond", serif',
  sans: '"DM Sans", sans-serif',
  script: '"Cormorant Garamond", serif',
}

function InvitePreview({
  data,
  template,
  primaryColor,
  textColor,
  fontStyle,
  dark,
  reliefEffect,
}: {
  data: InviteData
  template: Template
  primaryColor: PrimaryColor
  textColor: TextColor
  fontStyle: FontStyle
  dark: boolean
  reliefEffect: ReliefEffect
}) {
  const tpl = templates.find(t => t.id === template)!
  const accent = primaryColorHex[primaryColor]
  const fg = textColorHex[textColor]
  const bg = dark ? tpl.darkGradient : tpl.lightGradient
  const font = fontMap[fontStyle]

  const eventTypeLabels: Record<EventType, string> = {
    'Boda': '♡',
    'XV Años': '✦',
    'Cumpleaños': '★',
    'Bautizo': '✝',
    'Graduación': '♦',
    'Corporativo': '◆',
  }

  return (
    <div
      className="invite-phone-frame w-full max-w-[280px] mx-auto relative overflow-hidden flex flex-col"
      style={{ background: bg }}
    >
      {/* Top ornament */}
      <div
        className="flex-shrink-0 pt-8 px-6 flex flex-col items-center"
        style={{ borderBottom: `1px solid ${accent}22` }}
      >
        <div className="w-12 h-px mb-4" style={{ background: accent, opacity: 0.6 }} />
        <p
          className="text-[0.55rem] tracking-[0.3em] uppercase mb-2"
          style={{ color: accent, fontFamily: '"DM Sans", sans-serif' }}
        >
          {data.eventType || 'Tipo de Evento'}
        </p>
        <p className="text-3xl mb-1" style={{ color: accent }}>
          {data.eventType ? eventTypeLabels[data.eventType] : '♡'}
        </p>
        <div className="w-12 h-px mt-4 mb-6" style={{ background: accent, opacity: 0.6 }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 text-center gap-3">
        <p
          className="text-[0.65rem] tracking-[0.25em] uppercase"
          style={{ color: fg, opacity: 0.5, fontFamily: '"DM Sans", sans-serif' }}
        >
          Tenemos el honor de invitarlos a
        </p>

        <h2
          className={`text-2xl leading-tight${reliefEffect === 'foil' ? ' inv-foil-text' : ''}`}
          style={{
            ...( reliefEffect !== 'foil' ? { color: fg } : {
              background: `linear-gradient(135deg, ${accent} 0%, #f8e8b0 35%, ${accent}bb 55%, #e8d070 78%, ${accent} 100%)`,
            }),
            fontFamily: font,
            fontWeight: fontStyle === 'sans' ? 600 : 300,
            fontStyle: fontStyle === 'script' ? 'italic' : 'normal',
            ...(reliefEffect === 'emboss' && {
              textShadow: dark
                ? '1px 1px 3px rgba(0,0,0,0.6), -0.5px -0.5px 1.5px rgba(255,255,255,0.1)'
                : '1px 1px 2px rgba(0,0,0,0.14), -0.5px -0.5px 1px rgba(255,255,255,0.75)',
            }),
          }}
        >
          {data.name || 'Nombre del Festejado'}
        </h2>

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px" style={{ background: `${accent}33` }} />
          <div className="w-1 h-1 rounded-full" style={{ background: accent }} />
          <div className="flex-1 h-px" style={{ background: `${accent}33` }} />
        </div>

        {data.date && (
          <div>
            <p className="text-lg font-light" style={{ color: fg, fontFamily: font }}>
              {new Date(data.date + 'T12:00:00').toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            {data.time && (
              <p className="text-xs" style={{ color: fg, opacity: 0.6, fontFamily: '"DM Sans", sans-serif' }}>
                {data.time} hrs
              </p>
            )}
          </div>
        )}

        {data.venue && (
          <p
            className="text-xs tracking-wide"
            style={{ color: fg, opacity: 0.55, fontFamily: '"DM Sans", sans-serif' }}
          >
            {data.venue}
          </p>
        )}

        {data.message && (
          <p
            className="text-xs italic leading-relaxed mt-1"
            style={{ color: fg, opacity: 0.5, fontFamily: font }}
          >
            "{data.message}"
          </p>
        )}

        {data.showDresscode && data.dresscode && (
          <div className="mt-2 px-3 py-2 w-full" style={{
            border: `1px solid ${accent}33`,
            ...(reliefEffect === 'emboss' && {
              boxShadow: dark
                ? '3px 3px 7px rgba(0,0,0,0.5), -1.5px -1.5px 4px rgba(255,255,255,0.07)'
                : '3px 3px 7px rgba(0,0,0,0.1), -2px -2px 5px rgba(255,255,255,0.72)',
            }),
          }}>
            <p className="text-[0.55rem] tracking-[0.2em] uppercase" style={{ color: accent, fontFamily: '"DM Sans", sans-serif' }}>
              Código de Vestimenta
            </p>
            <p className="text-xs mt-0.5" style={{ color: fg, opacity: 0.7, fontFamily: '"DM Sans", sans-serif' }}>
              {data.dresscode}
            </p>
          </div>
        )}

        {data.showRsvp && data.rsvp && (
          <div
            className="mt-2 px-4 py-2 text-xs tracking-widest uppercase"
            style={{
              background: accent,
              color: dark ? '#0A0A0A' : '#fff',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.6rem',
            }}
          >
            Confirmar Asistencia
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 pb-6 px-6 flex flex-col items-center"
        style={{ borderTop: `1px solid ${accent}22` }}
      >
        <div className="w-12 h-px mt-5" style={{ background: accent, opacity: 0.4 }} />
        <p className="text-[0.5rem] tracking-[0.2em] uppercase mt-3" style={{ color: fg, opacity: 0.3, fontFamily: '"DM Sans", sans-serif' }}>
          Pedro Vargas Fotografía
        </p>
      </div>
    </div>
  )
}

type SaveState = 'idle' | 'saving' | 'saved'

function InvitationBuilderTeaser() {
  const { ref, inView } = useInView()
  return (
    <section id="invitaciones" className="section-padding bg-[#0A0A0A]" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="label-caps text-gold mb-4">Herramienta exclusiva</p>
          <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-3">
            Invitaciones Digitales
          </h2>
          <p className="font-cormorant italic text-ivory/40 text-xl mb-6">
            Micro-landing personalizada para tu evento
          </p>
          <div className="gold-line mx-auto mb-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {[
            {
              label: 'Invitación General',
              desc: 'Un enlace único que puedes compartir con todos tus invitados por WhatsApp o redes sociales.',
              icon: '✉',
            },
            {
              label: 'Individual Personalizada',
              desc: 'Cada invitado recibe su propio enlace con su nombre, mensaje y botón de confirmación RSVP.',
              icon: '✦',
            },
          ].map(card => (
            <div key={card.label} className="glass rounded-xl border border-white/8 p-7 text-center">
              <div className="text-3xl mb-4 text-gold">{card.icon}</div>
              <h3 className="font-cormorant text-ivory text-xl mb-2">{card.label}</h3>
              <p className="font-dm text-ivory/50 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary px-10 py-3"
          >
            Solicitar invitación <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default function InvitationBuilder() {
  const { ref, inView } = useInView()
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAdmin) return <InvitationBuilderTeaser />

  const [tab, setTab] = useState<Tab>('estilo')
  const [template, setTemplate] = useState<Template>('warm')
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>('gold')
  const [textColor, setTextColor] = useState<TextColor>('ivory')
  const [fontStyle, setFontStyle] = useState<FontStyle>('serif')
  const [dark, setDark] = useState(true)
  const [reliefEffect, setReliefEffect] = useState<ReliefEffect>('none')
  const [customHex, setCustomHex] = useState('')
  const [data, setData] = useState<InviteData>({
    eventType: 'Boda',
    name: '',
    date: '',
    time: '',
    venue: '',
    message: '',
    dresscode: '',
    showDresscode: false,
    rsvp: '',
    showRsvp: false,
  })

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedInvitationId, setSavedInvitationId] = useState<string | null>(null)
  const [savedToken, setSavedToken] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [saveError, setSaveError] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (field: keyof InviteData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setData(prev => ({ ...prev, [field]: e.target.value }))

  const toggle = (field: 'showDresscode' | 'showRsvp') => () =>
    setData(prev => ({ ...prev, [field]: !prev[field] }))

  const whatsappText = encodeURIComponent(
    `¡Estás invitado a mi ${data.eventType}!\n${data.name ? `${data.name}\n` : ''}${data.date ? `Fecha: ${data.date}\n` : ''}${data.venue ? `Lugar: ${data.venue}` : ''}`
  )

  const handleSave = async (): Promise<string | null> => {
    if (!isAuthenticated) {
      document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })
      return null
    }

    setSaveState('saving')
    setSaveError('')
    try {
      const effectSuffix = reliefEffect !== 'none' ? `-${reliefEffect}` : ''
      const payload = {
        eventType: data.eventType,
        title: `${data.eventType}${data.name ? ` de ${data.name}` : ''}`,
        names: data.name || 'Festejado',
        eventDate: data.date || new Date().toLocaleDateString('es-MX'),
        eventTime: data.time || undefined,
        venue: data.venue || undefined,
        message: data.message || undefined,
        dressCode: data.showDresscode ? data.dresscode : undefined,
        rsvpLabel: data.showRsvp ? 'Confirmar asistencia' : undefined,
        rsvpValue: data.showRsvp ? data.rsvp : undefined,
        template: `${template}${effectSuffix}`,
        primaryColor: primaryColorHex[primaryColor],
        textColor: textColorHex[textColor],
        fontStyle,
        isDark: dark,
        isPublished: true,
      }

      const res = savedInvitationId
        ? await api.put<{ data: { id: string; shareToken: string } }>(`/client/invitations/${savedInvitationId}`, payload)
        : await api.post<{ data: { id: string; shareToken: string } }>('/client/invitations', payload)

      const invitationId = res.data.id
      const token = res.data.shareToken

      setSavedInvitationId(invitationId)
      setSavedToken(token)

      if (photos.length > 0) {
        const form = new FormData()
        photos.forEach(photo => form.append('images', photo))
        await api.postForm(`/client/invitations/${invitationId}/photos`, form)
        setPhotos([])
      }

      setSaveState('saved')
      return token
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
      setSaveState('idle')
      return null
    }
  }

  const handleCopyLink = async () => {
    const token = savedToken ?? await handleSave()
    if (!token) return

    const url = `${window.location.origin}/invitacion/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    const token = savedToken ?? await handleSave()
    if (!token) return
    window.open(`/invitacion/${token}`, '_blank')
  }

  return (
    <section
      id="invitaciones"
      className="section-padding bg-[#0A0A0A]"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <p className="label-caps text-gold mb-4">Herramienta exclusiva</p>
          <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-3">
            Crea tu Invitación Digital
          </h2>
          <p className="font-cormorant italic text-ivory/40 text-xl">
            Diseña en minutos · Comparte al instante
          </p>
          <div className="gold-line mt-5 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid lg:grid-cols-[1fr_380px] gap-8 xl:gap-14"
        >
          {/* LEFT — Controls */}
          <div className="glass rounded-sm p-6 md:p-8">
            {/* Tab selector */}
            <div className="flex border-b border-ivory/10 mb-8">
              {(['estilo', 'texto', 'colores'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 pb-3 label-caps text-[0.65rem] transition-all duration-300 border-b-2 -mb-px ${
                    tab === t
                      ? 'text-gold border-gold'
                      : 'text-ivory/30 border-transparent hover:text-ivory/60'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── TAB: Estilo ── */}
              {tab === 'estilo' && (
                <motion.div
                  key="estilo"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="label-caps text-ivory/40 text-[0.6rem] mb-5">Elige una plantilla</p>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => setTemplate(tpl.id)}
                        className={`p-3 text-left border transition-all duration-300 ${
                          template === tpl.id
                            ? 'border-gold bg-gold/8'
                            : 'border-ivory/10 hover:border-ivory/25'
                        }`}
                      >
                        <div
                          className="w-full h-16 rounded-sm mb-3"
                          style={{ background: dark ? tpl.darkGradient : tpl.lightGradient }}
                        />
                        <p className="font-dm text-ivory text-sm font-medium">{tpl.label}</p>
                        <p className="font-dm text-ivory/40 text-xs mt-0.5">{tpl.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── TAB: Texto ── */}
              {tab === 'texto' && (
                <motion.div
                  key="texto"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">Tipo de Evento</label>
                    <div className="relative">
                      <select
                        value={data.eventType}
                        onChange={set('eventType') as React.ChangeEventHandler<HTMLSelectElement>}
                        className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 appearance-none focus:border-gold/40 focus:outline-none transition-colors"
                      >
                        {(['Boda', 'XV Años', 'Cumpleaños', 'Bautizo', 'Graduación', 'Corporativo'] as EventType[]).map(et => (
                          <option key={et} value={et}>{et}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/30 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">Nombre(s) del Festejado</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={set('name')}
                      placeholder="Ej. Ana & Carlos"
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">Fecha</label>
                      <input
                        type="date"
                        value={data.date}
                        onChange={set('date')}
                        className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-3 py-3 focus:border-gold/40 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">Hora</label>
                      <input
                        type="time"
                        value={data.time}
                        onChange={set('time')}
                        className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-3 py-3 focus:border-gold/40 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">Lugar / Venue</label>
                    <input
                      type="text"
                      value={data.venue}
                      onChange={set('venue')}
                      placeholder="Ej. Hacienda San Rafael, CDMX"
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">
                      Mensaje Personalizado <span className="text-ivory/20">({data.message.length}/100)</span>
                    </label>
                    <textarea
                      value={data.message}
                      onChange={set('message')}
                      maxLength={100}
                      rows={3}
                      placeholder="Tu presencia hará especial este momento..."
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 resize-none transition-colors"
                    />
                  </div>

                  {/* Dresscode toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-caps text-ivory/40 text-[0.6rem]">¿Código de Vestimenta?</label>
                      <button
                        onClick={toggle('showDresscode')}
                        className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${data.showDresscode ? 'bg-gold' : 'bg-ivory/15'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${data.showDresscode ? 'left-5' : 'left-0.5'}`}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {data.showDresscode && (
                        <motion.input
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          type="text"
                          value={data.dresscode}
                          onChange={set('dresscode')}
                          placeholder="Ej. Etiqueta formal, blanco y dorado"
                          className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* RSVP toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-caps text-ivory/40 text-[0.6rem]">¿Confirmar Asistencia?</label>
                      <button
                        onClick={toggle('showRsvp')}
                        className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${data.showRsvp ? 'bg-gold' : 'bg-ivory/15'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${data.showRsvp ? 'left-5' : 'left-0.5'}`}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {data.showRsvp && (
                        <motion.input
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          type="text"
                          value={data.rsvp}
                          onChange={set('rsvp')}
                          placeholder="Link o teléfono para confirmar"
                          className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-2">
                      Fotos para la invitacion
                    </label>
                    <div className="w-full bg-[#1A1A1A] border border-ivory/10 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Images className="w-4 h-4 text-gold/70" />
                        <p className="font-dm text-ivory/70 text-xs">Galeria de la invitacion (maximo 8)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => setPhotos(Array.from(e.target.files || []).slice(0, 8))}
                        className="w-full bg-black/20 border border-ivory/10 text-ivory/70 font-dm text-xs px-3 py-2"
                      />
                      <p className="font-dm text-ivory/35 text-[0.65rem] mt-2">
                        {photos.length > 0 ? photos.length + ' foto(s) lista(s) para subir.' : 'Aun no has agregado fotos.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB: Colores ── */}
              {tab === 'colores' && (
                <motion.div
                  key="colores"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-7"
                >
                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-3">Color Primario</label>
                    <div className="flex gap-2 flex-wrap">
                      {colorSwatches.map(sw => (
                        <button
                          key={sw.id}
                          onClick={() => setPrimaryColor(sw.id)}
                          title={sw.label}
                          className={`w-8 h-8 rounded-full transition-all duration-200 ${
                            primaryColor === sw.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-[#111]' : ''
                          }`}
                          style={{ background: sw.hex }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3 items-center">
                      <input
                        type="text"
                        value={customHex}
                        onChange={e => setCustomHex(e.target.value)}
                        placeholder="#C9A96E"
                        className="flex-1 bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-3 py-2 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20"
                      />
                      <div
                        className="w-8 h-8 border border-ivory/10"
                        style={{ background: customHex.startsWith('#') && customHex.length >= 4 ? customHex : '#333' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-3">Color de Texto</label>
                    <div className="flex gap-2">
                      {(['ivory', 'white', 'black'] as TextColor[]).map(tc => (
                        <button
                          key={tc}
                          onClick={() => setTextColor(tc)}
                          className={`px-4 py-2 text-xs font-dm border transition-all duration-200 ${
                            textColor === tc
                              ? 'border-gold text-gold'
                              : 'border-ivory/15 text-ivory/40 hover:border-ivory/30'
                          }`}
                        >
                          {tc === 'ivory' ? 'Marfil' : tc === 'white' ? 'Blanco' : 'Negro'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-3">Estilo de Tipografía</label>
                    <div className="flex gap-2">
                      {([
                        { id: 'serif' as FontStyle, label: 'Clásico' },
                        { id: 'sans' as FontStyle, label: 'Moderno' },
                        { id: 'script' as FontStyle, label: 'Script' },
                      ]).map(fs => (
                        <button
                          key={fs.id}
                          onClick={() => setFontStyle(fs.id)}
                          className={`flex-1 py-2 text-xs font-dm border transition-all duration-200 ${
                            fontStyle === fs.id
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-ivory/15 text-ivory/40 hover:border-ivory/30'
                          }`}
                        >
                          {fs.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="label-caps text-ivory/40 text-[0.6rem]">Fondo Oscuro / Claro</label>
                    <button
                      onClick={() => setDark(!dark)}
                      className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${dark ? 'bg-gold' : 'bg-ivory/30'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${dark ? 'left-5' : 'left-0.5'}`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="label-caps text-ivory/40 text-[0.6rem] block mb-3">Efecto de Relieve</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'none'   as ReliefEffect, label: 'Ninguno' },
                        { id: 'emboss' as ReliefEffect, label: 'Relieve' },
                        { id: 'foil'   as ReliefEffect, label: 'Lámina' },
                      ]).map(ef => (
                        <button
                          key={ef.id}
                          onClick={() => setReliefEffect(ef.id)}
                          className={`py-2.5 text-xs font-dm border transition-all duration-200 ${
                            reliefEffect === ef.id
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-ivory/15 text-ivory/40 hover:border-ivory/30 hover:text-ivory/70'
                          }`}
                        >
                          {ef.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-ivory/25 text-[0.6rem] font-dm mt-2">
                      {reliefEffect === 'emboss' && 'Efecto de alto relieve sobre el texto principal.'}
                      {reliefEffect === 'foil' && 'Efecto de lamina metalica dorada animada.'}
                      {reliefEffect === 'none' && 'Sin efecto adicional de relieve.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Live Preview */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 flex items-start justify-center lg:justify-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={template}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <InvitePreview
                    data={data}
                    template={template}
                    primaryColor={primaryColor}
                    textColor={textColor}
                    fontStyle={fontStyle}
                    dark={dark}
                    reliefEffect={reliefEffect}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {/* Save / saved state */}
              {saveState === 'saved' && savedToken && (
                <div className="border border-green-500/30 bg-green-500/5 rounded-sm px-4 py-3 flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 text-xs font-dm font-medium">Invitacion guardada</p>
                    <p className="text-ivory/40 text-xs font-dm truncate mt-0.5">
                      /invitacion/{savedToken}
                    </p>
                  </div>
                  <a
                    href={`/invitacion/${savedToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-light flex-shrink-0"
                    title="Abrir invitacion"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saveState === 'saving'}
                className={`btn-primary justify-center gap-3 py-3 ${saveState === 'saving' ? 'opacity-70 cursor-wait' : ''}`}
              >
                {saveState === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : isAuthenticated ? (
                  <>
                    <Save className="w-4 h-4" />
                    {savedInvitationId ? 'Actualizar invitacion' : 'Guardar invitacion'}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Inicia sesion para guardar
                  </>
                )}
              </button>

              {saveError && (
                <p className="text-red-400 text-xs font-dm text-center">{saveError}</p>
              )}

              {/* Download / open */}
              <button
                onClick={handleDownload}
                className="btn-primary justify-center gap-3 py-3 !bg-transparent !text-ivory/70 !border !border-ivory/15 hover:!border-ivory/30 hover:!text-ivory"
              >
                <Download className="w-4 h-4" />
                {savedToken ? 'Abrir invitación completa' : 'Guardar y abrir'}
              </button>

              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline justify-center gap-3 py-3 !text-[#4CAF50] !border-[#4CAF50]/40 hover:!border-[#4CAF50] hover:!text-[#4CAF50]"
              >
                <MessageCircle className="w-4 h-4" />
                Compartir por WhatsApp
              </a>

              <button
                onClick={handleCopyLink}
                className="btn-outline justify-center gap-3 py-3"
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-green-400" /> Enlace copiado</>
                ) : (
                  <><Link className="w-4 h-4" /> {savedToken ? 'Copiar enlace' : 'Guardar y copiar enlace'}</>
                )}
              </button>
            </div>

            {/* Auth / upsell note */}
            {!isAuthenticated ? (
              <p className="font-dm text-ivory/30 text-xs leading-relaxed text-center">
                <button
                  onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gold hover:text-gold-light transition-colors inline-flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" /> Inicia sesión
                </button>{' '}
                para guardar y compartir tu invitación digital.
              </p>
            ) : (
              <p className="font-dm text-ivory/30 text-xs leading-relaxed text-center">
                ¿Quieres una invitación personalizada profesional?{' '}
                <button
                  onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gold hover:text-gold-light transition-colors inline-flex items-center gap-1"
                >
                  Contáctanos <ArrowRight className="w-3 h-3" />
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
