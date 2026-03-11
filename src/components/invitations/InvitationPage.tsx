import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import InvitationStrip from './InvitationStrip'
import api from '../../api/client'
import { ApiInvitation, demoInvitation } from './invitationTypes'

const ES_MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
}

function parseEventDate(raw: string): Date | null {
  if (!raw) return null
  // Try native parse first (ISO or "YYYY-MM-DD")
  const native = new Date(raw)
  if (!isNaN(native.getTime())) return native
  // Try Spanish format: "12 junio 2026" or "12 de junio de 2026"
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
    { label: 'Días',   value: Math.floor(total / 86400) },
    { label: 'Horas',  value: Math.floor((total % 86400) / 3600) },
    { label: 'Min',    value: Math.floor((total % 3600) / 60) },
    { label: 'Seg',    value: total % 60 },
  ]
}

function EventCountdown({ eventDate, accent }: { eventDate: string; accent: string }) {
  const target = useMemo(() => parseEventDate(eventDate), [eventDate])
  const [units, setUnits] = useState(() => target ? getCountdownUnits(target) : null)

  useEffect(() => {
    if (!target) return
    if (target.getTime() <= Date.now()) return
    setUnits(getCountdownUnits(target))
    const id = setInterval(() => setUnits(getCountdownUnits(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target || !units) return null
  if (target.getTime() <= Date.now()) return (
    <div className="text-center py-3">
      <span className="text-xs font-dm uppercase tracking-widest" style={{ color: accent }}>¡El evento es hoy!</span>
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-3 py-5">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] font-dm" style={{ color: accent }}>
        Cuenta regresiva al evento
      </p>
      <div className="flex items-end gap-4">
        {units.map(u => (
          <div key={u.label} className="flex flex-col items-center">
            <span
              className="text-3xl font-cormorant font-bold tabular-nums leading-none"
              style={{ color: accent }}
            >
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="text-[0.55rem] uppercase tracking-widest font-dm mt-1" style={{ color: `${accent}88` }}>
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InvitationPage() {
  const { token } = useParams()
  const [invitation, setInvitation] = useState<ApiInvitation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const resolvedToken = useMemo(() => token || '', [token])

  useEffect(() => {
    if (!resolvedToken) return
    if (resolvedToken === 'demo') {
      setInvitation(demoInvitation)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    api
      .get<{ data: ApiInvitation }>(`/public/invitation/${resolvedToken}`)
      .then(res => setInvitation(res.data))
      .catch(() => setInvitation(null))
      .finally(() => setIsLoading(false))
  }, [resolvedToken])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-ivory flex items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-ivory flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="label-caps text-gold mb-3">Invitación no encontrada</p>
          <h1 className="font-cormorant text-2xl mb-4">Esta invitación no está disponible</h1>
          <p className="text-ivory/60 text-sm font-dm mb-6">
            Verifica el enlace o pide a tu estudio que la vuelva a publicar.
          </p>
          <Link to="/" className="btn-primary">
            Volver al sitio
          </Link>
        </div>
      </div>
    )
  }

  const baseTemplate = String(invitation.template ?? 'warm').replace(/-emboss$|-foil$/, '')
  const ACCENT_MAP: Record<string, string> = {
    warm: '#a8723a', floral: '#b5607a', rustic: '#c9a96e', moderno: '#7baee0',
    vintage: '#7a4a1e', pearl: '#7878aa', esmeralda: '#4dba7c', noir: '#d0d0d0',
    lavanda: '#7a50c8', terracota: '#aa4b2d',
  }
  const accent = ACCENT_MAP[baseTemplate] ?? '#C9A96E'

  return (
    <div className="min-h-screen bg-[#1a120d]">
      <header className="sticky top-0 z-30 bg-[#1a120d]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-[520px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Invitación digital</p>
            <h2 className="font-cormorant text-lg text-ivory">{invitation.title}</h2>
          </div>
          <Link to="/" className="text-ivory/70 text-xs font-dm hover:text-ivory">
            Ir al sitio
          </Link>
        </div>
      </header>

      <main className="py-8 px-4">
        {/* Event countdown — only for general invitations */}
        {(invitation as any).invitationType !== 'individual' && (
          <div className="max-w-[520px] mx-auto mb-6 rounded-2xl border"
            style={{ borderColor: `${accent}30`, background: `${accent}08` }}>
            <EventCountdown eventDate={invitation.eventDate} accent={accent} />
          </div>
        )}

        <div className="max-w-[520px] mx-auto shadow-[0_40px_120px_rgba(0,0,0,0.6)] rounded-[28px] overflow-hidden">
          {(() => {
            const shareUrl = typeof window !== 'undefined'
              ? `${window.location.origin}/invitacion/${invitation.shareToken}`
              : `/invitacion/${invitation.shareToken}`
            return (
          <InvitationStrip
            invitation={invitation}
            shareUrl={shareUrl}
          />
            )
          })()}
        </div>

        {/* Greeting block */}
        <div className="max-w-[520px] mx-auto px-6 pt-10 pb-4 text-center">
          <p className="font-cormorant text-2xl text-ivory">
            {invitation.guestGreeting || 'Hola'}, <span style={{ color: accent }}>{invitation.defaultGuestName || 'Familia y Amigos'}</span>
          </p>
          <p className="text-ivory/50 text-sm font-dm mt-1">
            tienen una invitación especial
          </p>
        </div>
      </main>
    </div>
  )
}
