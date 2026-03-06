import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import InvitationStrip from './InvitationStrip'
import api from '../../api/client'
import { ApiInvitation, demoInvitation } from './invitationTypes'

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
          <p className="label-caps text-gold mb-3">Invitacion no encontrada</p>
          <h1 className="font-cormorant text-2xl mb-4">Esta invitacion no esta disponible</h1>
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

  return (
    <div className="min-h-screen bg-[#1a120d]">
      <header className="sticky top-0 z-30 bg-[#1a120d]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-[520px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Invitacion digital</p>
            <h2 className="font-cormorant text-lg text-ivory">{invitation.title}</h2>
          </div>
          <Link to="/" className="text-ivory/70 text-xs font-dm hover:text-ivory">
            Ir al sitio
          </Link>
        </div>
      </header>

      <main className="py-8 px-4">
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

        {/* Greeting block (like in guest page) */}
        <div className="max-w-[520px] mx-auto px-6 pt-10 pb-4 text-center">
          <p className="font-cormorant text-2xl text-ivory">
            {invitation.guestGreeting || 'Hola'}, <span className="text-gold">{invitation.defaultGuestName || 'Familia y Amigos'}</span>
          </p>
          <p className="text-ivory/50 text-sm font-dm mt-1">
            tienen una invitación especial
          </p>
        </div>
      </main>
    </div>
  )
}
