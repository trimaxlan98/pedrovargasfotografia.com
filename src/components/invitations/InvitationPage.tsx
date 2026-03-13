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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
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

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/invitacion/${invitation.shareToken}`
      : `/invitacion/${invitation.shareToken}`

  return (
    <div className="min-h-screen bg-[#1a120d]">
      <header className="sticky top-0 z-30 bg-[#1a120d]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-[520px] mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.3em] text-gold font-dm">
              Invitación digital
            </p>
            <h2 className="font-cormorant text-base text-ivory leading-tight">{invitation.title}</h2>
          </div>
          <Link to="/" className="text-ivory/50 text-xs font-dm hover:text-ivory transition-colors">
            Ir al sitio
          </Link>
        </div>
      </header>

      <main className="py-6 px-4">
        <div className="max-w-[520px] mx-auto shadow-[0_40px_120px_rgba(0,0,0,0.6)] rounded-[28px] overflow-hidden">
          <InvitationStrip invitation={invitation} shareUrl={shareUrl} />
        </div>
      </main>
    </div>
  )
}
