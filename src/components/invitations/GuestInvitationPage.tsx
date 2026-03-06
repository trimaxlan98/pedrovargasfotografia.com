import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import InvitationStrip from './InvitationStrip'
import RsvpCountdown from './RsvpCountdown'
import api from '../../api/client'
import { ApiInvitation, ApiInvitationGuest } from './invitationTypes'

const ACCENT_BY_TEMPLATE: Record<string, string> = {
  warm: '#a8723a',
  floral: '#b5607a',
  rustic: '#c9a96e',
  moderno: '#7baee0',
}

interface GuestData {
  guest: ApiInvitationGuest
  invitation: ApiInvitation
}

export default function GuestInvitationPage() {
  const { guestToken } = useParams<{ guestToken: string }>()
  const [data, setData] = useState<GuestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rsvpStatus, setRsvpStatus] = useState<'PENDING' | 'ACCEPTED' | 'DECLINED' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [deadlineExpired, setDeadlineExpired] = useState(false)

  useEffect(() => {
    if (!guestToken) return
    setIsLoading(true)
    api
      .get<{ data: GuestData }>(`/public/guest/${guestToken}`)
      .then(res => {
        setData(res.data)
        setRsvpStatus(res.data.guest.response as 'PENDING' | 'ACCEPTED' | 'DECLINED')
        const dl = res.data.invitation.rsvpDeadline
        if (dl && new Date(dl) <= new Date()) setDeadlineExpired(true)
      })
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [guestToken])

  async function submitRsvp(response: 'ACCEPTED' | 'DECLINED') {
    if (!guestToken || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await api.post<{ message: string }>(`/public/guest/${guestToken}/rsvp`, { response })
      setRsvpStatus(response)
      setMessage(res.message ?? (response === 'ACCEPTED' ? '¡Gracias por confirmar!' : 'Recibimos tu respuesta.'))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error al enviar respuesta')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-ivory flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="label-caps text-gold mb-3">Invitación no encontrada</p>
          <h1 className="font-cormorant text-2xl mb-4">Este enlace no está disponible</h1>
          <p className="text-ivory/60 text-sm font-dm mb-6">
            Verifica el enlace o contacta a quien te lo compartió.
          </p>
          <Link to="/" className="btn-primary">Volver al sitio</Link>
        </div>
      </div>
    )
  }

  const { guest, invitation } = data
  const accent = ACCENT_BY_TEMPLATE[invitation.template] ?? '#C9A96E'
  const shareUrl = `${window.location.origin}/invitacion/${invitation.shareToken}`

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-[520px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] font-dm" style={{ color: accent }}>
              Invitación personal
            </p>
            <h2 className="font-cormorant text-lg text-ivory">{invitation.title}</h2>
          </div>
          <Link to="/" className="text-ivory/50 text-xs font-dm hover:text-ivory transition-colors">
            Ir al sitio
          </Link>
        </div>
      </header>

      {/* Greeting */}
      <div className="max-w-[520px] mx-auto px-6 pt-6 pb-2">
        <p className="font-cormorant text-2xl text-ivory">
          {invitation.guestGreeting || 'Hola'}, <span style={{ color: accent }}>{guest.name}</span>
        </p>
        <p className="text-ivory/50 text-sm font-dm mt-1">
          {guest.personalizedMessage || 'tienes una invitación especial'}
        </p>
      </div>

      {/* Invitation strip */}
      <main className="py-4 px-4">
        <div className="max-w-[520px] mx-auto shadow-[0_40px_120px_rgba(0,0,0,0.6)] rounded-[28px] overflow-hidden">
          <InvitationStrip invitation={invitation} shareUrl={shareUrl} />
        </div>
      </main>

      {/* Sticky RSVP footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10">
        <div className="max-w-[520px] mx-auto px-6 py-4 space-y-3">

          {/* Countdown */}
          {invitation.rsvpDeadline && !deadlineExpired && rsvpStatus === 'PENDING' && (
            <RsvpCountdown deadline={invitation.rsvpDeadline} accentColor={accent} />
          )}

          {/* Message (post-response or error) */}
          {message && (
            <p className="text-center text-sm font-dm" style={{ color: accent }}>{message}</p>
          )}

          {/* RSVP Buttons */}
          {rsvpStatus === 'PENDING' && !deadlineExpired ? (
            <div className="flex gap-3">
              <button
                onClick={() => submitRsvp('ACCEPTED')}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl text-sm font-dm font-medium transition-all disabled:opacity-50"
                style={{ background: accent, color: '#0A0A0A' }}
              >
                {isSubmitting ? '...' : '✓ Confirmo mi asistencia'}
              </button>
              <button
                onClick={() => submitRsvp('DECLINED')}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl text-sm font-dm border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                ✗ No podré asistir
              </button>
            </div>
          ) : rsvpStatus === 'ACCEPTED' ? (
            <div className="text-center py-2">
              <span className="text-green-400 font-dm text-sm">✓ Has confirmado tu asistencia</span>
            </div>
          ) : rsvpStatus === 'DECLINED' ? (
            <div className="text-center py-2">
              <span className="text-red-400 font-dm text-sm">✗ Has declinado la invitación</span>
            </div>
          ) : deadlineExpired ? (
            <div className="text-center py-2">
              <span className="text-ivory/40 font-dm text-sm">El tiempo para confirmar ha vencido</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
