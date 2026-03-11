import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays, Mail, LogOut, Plus, Eye, CheckCircle, Clock, XCircle,
  ExternalLink, Pencil, Copy, Check, ToggleLeft, ToggleRight, Users, Home, Moon, Sun, HelpCircle,
  Archive,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'
import InvitationWizard from '../invitations/InvitationWizard'
import GuestListPanel from './GuestListPanel'
import ClientTutorial from './ClientTutorial'
import TermsModal from './TermsModal'
import { ApiInvitation } from '../invitations/invitationTypes'

interface Booking {
  id: string
  service: string
  eventDate: string
  eventType: string
  venue?: string
  status: string
  notes?: string
  totalPrice?: number
  archivedAt?: string | null
  archiveReason?: string | null
  createdAt: string
}

type InvitationItem = ApiInvitation

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING:      { label: 'Pendiente',       icon: Clock,        color: 'text-yellow-400' },
  CONFIRMED:    { label: 'Confirmado',      icon: CheckCircle,  color: 'text-green-400' },
  DEPOSIT_PAID: { label: 'Depósito pagado', icon: CheckCircle,  color: 'text-teal-400' },
  IN_PROGRESS:  { label: 'En progreso',     icon: Clock,        color: 'text-blue-400' },
  COMPLETED:    { label: 'Completado',      icon: CheckCircle,  color: 'text-emerald-400' },
  CANCELLED:    { label: 'Cancelado',       icon: XCircle,      color: 'text-red-400' },
}

type Tab = 'bookings' | 'invitations' | 'history'

export default function ClientPortal() {
  const { user, logout, refreshUser } = useAuth()
  const [tab, setTab] = useState<Tab>('bookings')
  const [showTerms, setShowTerms] = useState(false)

  // Show T&C modal if client hasn't accepted terms yet
  useEffect(() => {
    if (user && user.role === 'CLIENT' && !user.termsAcceptedAt) {
      setShowTerms(true)
    }
  }, [user])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invitations, setInvitations] = useState<InvitationItem[]>([])
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([])
  const [historyInvitations, setHistoryInvitations] = useState<InvitationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showInvitationWizard, setShowInvitationWizard] = useState(false)
  const [editInvitation, setEditInvitation] = useState<InvitationItem | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null)
  const [guestPanelInv, setGuestPanelInv] = useState<InvitationItem | null>(null)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (tab === 'bookings') loadBookings()
    if (tab === 'invitations') loadInvitations()
    if (tab === 'history') loadHistory()
  }, [tab])

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  async function loadBookings() {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: Booking[] }>('/client/bookings')
      setBookings(res.data)
    } finally { setIsLoading(false) }
  }

  async function loadInvitations() {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: InvitationItem[] }>('/client/invitations')
      setInvitations(res.data)
    } finally { setIsLoading(false) }
  }

  async function loadHistory() {
    setIsLoading(true)
    try {
      const [bookingRes, invitationRes] = await Promise.all([
        api.get<{ data: Booking[] }>('/client/history/bookings'),
        api.get<{ data: InvitationItem[] }>('/client/history/invitations'),
      ])
      setHistoryBookings(bookingRes.data)
      setHistoryInvitations(invitationRes.data)
    } finally { setIsLoading(false) }
  }

  async function cancelBooking(id: string) {
    if (!confirm('¿Cancelar esta reserva?')) return
    try {
      await api.patch(`/client/bookings/${id}/cancel`)
      loadBookings()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al cancelar')
    }
  }

  async function toggleInvitationPublished(inv: InvitationItem) {
    try {
      await api.patch(`/client/invitations/${inv.id}/toggle-published`)
      loadInvitations()
    } catch { /* silent */ }
  }

  async function archiveInvitation(id: string) {
    try {
      await api.post(`/client/invitations/${id}/archive`, { reason: 'Client archived' })
      setArchiveConfirm(null)
      loadInvitations()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al archivar')
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/invitacion/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  function openEdit(inv: InvitationItem) {
    setEditInvitation(inv)
    setShowInvitationWizard(true)
  }

  function closeWizard() {
    setShowInvitationWizard(false)
    setEditInvitation(null)
  }

  return (
    <div className="min-h-screen bg-near-black">
      {/* Terms modal — shown before tutorial on first login */}
      {showTerms && (
        <TermsModal
          onAccepted={async () => {
            await refreshUser()
            setShowTerms(false)
          }}
          onDeclined={logout}
        />
      )}
      {/* Tutorial only renders once terms are accepted */}
      {!showTerms && <ClientTutorial />}
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="label-caps text-gold text-xs">Mi Cuenta</p>
            <h1 className="font-cormorant text-xl text-ivory">{user?.name}</h1>
            <p className="text-ivory/40 text-xs font-dm">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('spotlight:reset', { detail: { tourKey: 'client_tour_done' } }))}
              aria-label="Ver tutorial"
              title="Ver tutorial"
              className="w-9 h-9 flex items-center justify-center rounded-full text-ivory/60 hover:text-gold transition-colors hover:bg-white/5"
            >
              <HelpCircle size={17} />
            </button>
            <button
              onClick={() => setDark(d => !d)}
              aria-label="Cambiar modo"
              className="w-9 h-9 flex items-center justify-center rounded-full text-ivory/60 hover:text-gold transition-colors hover:bg-white/5"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a
              href="/"
              className="flex items-center gap-2 text-ivory/50 hover:text-gold text-sm font-dm transition-colors px-3 py-1.5 rounded-lg hover:bg-gold/8"
            >
              <Home size={16} />
              Volver al Sitio
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-ivory/50 hover:text-ivory text-sm font-dm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-0">
          {([
            { id: 'bookings', label: 'Mis Reservas', icon: CalendarDays },
            { id: 'invitations', label: 'Mis Invitaciones', icon: Mail },
            { id: 'history', label: 'Historial', icon: Eye },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-client-tour={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-dm border-b-2 -mb-px transition-colors ${
                tab === id
                  ? 'border-gold text-[#6A4B1F] dark:text-gold'
                  : 'border-transparent text-ivory/50 hover:text-ivory'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Bookings tab ── */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-ivory/50 text-sm font-dm">{bookings.length} reservas</p>
              <button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
              >
                <Plus size={16} />
                Nueva reserva
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass rounded-xl border border-white/5 p-12 text-center">
                <CalendarDays className="mx-auto text-ivory/20 mb-4" size={40} />
                <p className="text-ivory/40 font-dm">No tienes reservas aún</p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="btn-outline mt-4 px-6 py-2 text-sm"
                >
                  Hacer una reserva
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG['PENDING']
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={b.id}
                      className="glass rounded-xl border border-white/5 p-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-ivory font-dm font-medium">{b.service}</h3>
                            <span className={`flex items-center gap-1 text-xs font-dm ${cfg.color}`}>
                              <Icon size={12} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-ivory/50 text-sm font-dm">
                            {b.eventType} · {new Date(b.eventDate).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                          </p>
                          {b.venue && <p className="text-ivory/40 text-xs font-dm mt-1">{b.venue}</p>}
                          {b.totalPrice && (
                            <p className="text-gold text-sm font-dm mt-2">
                              Total: ${b.totalPrice.toLocaleString('es-MX')} MXN
                            </p>
                          )}
                        </div>
                        {['PENDING', 'CONFIRMED'].includes(b.status) && (
                          <button
                            onClick={() => cancelBooking(b.id)}
                            className="text-ivory/30 hover:text-danger transition-colors flex-shrink-0"
                            title="Cancelar reserva"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="glass rounded-xl border border-white/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-ivory font-dm">Reservas archivadas</h3>
                    <span className="text-ivory/40 text-xs font-dm">{historyBookings.length}</span>
                  </div>
                  {historyBookings.length === 0 ? (
                    <p className="text-ivory/35 text-sm font-dm">Sin reservas históricas.</p>
                  ) : (
                    <div className="space-y-3">
                      {historyBookings.map(b => (
                        <div key={b.id} className="border border-white/10 rounded-lg px-4 py-3 bg-white/3">
                          <p className="text-ivory text-sm font-dm">{b.service}</p>
                          <p className="text-ivory/50 text-xs font-dm mt-0.5">{b.eventType} · {new Date(b.eventDate).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
                          <p className="text-ivory/35 text-xs font-dm mt-1">
                            Archivada: {b.archivedAt ? new Date(b.archivedAt).toLocaleDateString('es-MX', { dateStyle: 'long' }) : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass rounded-xl border border-white/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-ivory font-dm">Invitaciones archivadas</h3>
                    <span className="text-ivory/40 text-xs font-dm">{historyInvitations.length}</span>
                  </div>
                  {historyInvitations.length === 0 ? (
                    <p className="text-ivory/35 text-sm font-dm">Sin invitaciones históricas.</p>
                  ) : (
                    <div className="space-y-3">
                      {historyInvitations.map(inv => (
                        <div key={inv.id} className="border border-white/10 rounded-lg px-4 py-3 bg-white/3">
                          <p className="text-ivory text-sm font-dm">{inv.title}</p>
                          <p className="text-ivory/50 text-xs font-dm mt-0.5">{inv.eventType} · {inv.eventDate}</p>
                          <p className="text-ivory/35 text-xs font-dm mt-1">
                            Archivada: {inv.archivedAt ? new Date(inv.archivedAt).toLocaleDateString('es-MX', { dateStyle: 'long' }) : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Invitations tab ── */}
        {tab === 'invitations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-ivory/50 text-sm font-dm">
                {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="glass rounded-xl border border-white/5 p-12 text-center">
                <Mail className="mx-auto text-ivory/20 mb-4" size={40} />
                <p className="text-ivory/40 font-dm">No tienes invitaciones digitales</p>
                <p className="text-ivory/30 text-sm font-dm mt-2">
                  Tu fotógrafo creará y asignará tus invitaciones desde el panel administrativo.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {invitations.map(inv => {
                  const stats = inv.guestStats ?? { total: 0, confirmed: 0, pending: 0, declined: 0 }
                  return (
                  <motion.div
                    key={inv.id}
                    className="glass rounded-xl border border-white/5 p-5 flex flex-col gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-ivory font-dm font-medium truncate">{inv.title}</h3>
                        <p className="text-ivory/50 text-sm font-dm mt-0.5">
                          {inv.eventType} · {inv.eventDate}
                        </p>
                      </div>
                      {/* Toggle published badge */}
                      <button
                        onClick={() => toggleInvitationPublished(inv)}
                        className={`flex items-center gap-1 text-xs font-dm px-2 py-1 rounded-full flex-shrink-0 transition-colors ${
                          inv.isPublished
                            ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                            : 'bg-gray-400/10 text-gray-400 hover:bg-gray-400/20'
                        }`}
                        title="Clic para publicar/despublicar"
                      >
                        {inv.isPublished ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
                        {inv.isPublished ? 'Publicada' : 'Borrador'}
                      </button>
                    </div>

                    {/* Stats row */}
                    <div className="space-y-2 border-y border-white/5 py-3">
                      <div className="flex items-center gap-3 text-xs font-dm text-ivory/40">
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {inv.views} vistas
                        </span>
                        <span className="ml-auto text-ivory/30">{stats.total} invitados</span>
                      </div>
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory/30 font-dm">
                        Invitados confirmados y en espera
                      </p>
                      <div className="flex items-center gap-3 text-xs font-dm">
                        <span className="text-green-400">Confirmados: {stats.confirmed}</span>
                        <span className="text-ivory/45">En espera: {stats.pending}</span>
                        <span className="text-red-400 ml-auto">No asistiran: {stats.declined}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(inv)}
                        className="flex items-center gap-1.5 text-xs font-dm text-ivory/50 hover:text-gold transition-colors px-2 py-1.5"
                      >
                        <Pencil size={12} /> Editar
                      </button>

                      {/* Guests */}
                      <button
                        onClick={() => setGuestPanelInv(inv)}
                        className="flex items-center gap-1.5 text-xs font-dm text-ivory/50 hover:text-gold transition-colors px-2 py-1.5"
                        title="Gestionar invitados"
                      >
                        <Users size={12} /> Invitados
                      </button>

                      {/* Copy link */}
                      <button
                        onClick={() => copyLink(inv.shareToken)}
                        className={`flex items-center gap-1.5 text-xs font-dm transition-colors px-2 py-1.5 ${
                          copied === inv.shareToken
                            ? 'text-green-400'
                            : 'text-ivory/50 hover:text-ivory'
                        }`}
                        title="Copiar enlace"
                      >
                        {copied === inv.shareToken ? <Check size={12} /> : <Copy size={12} />}
                        {copied === inv.shareToken ? 'Copiado' : 'Copiar'}
                      </button>

                      {/* View */}
                      <a
                        href={`/invitacion/${inv.shareToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-dm text-gold hover:text-gold-light transition-colors px-2 py-1.5 ml-auto"
                      >
                        Ver <ExternalLink size={11} />
                      </a>

                      {/* Delete */}
                      {archiveConfirm === inv.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => archiveInvitation(inv.id)}
                            className="text-red-400 text-xs font-dm hover:text-red-300"
                          >
                            ¿Archivar?
                          </button>
                          <button
                            onClick={() => setArchiveConfirm(null)}
                            className="text-ivory/30 text-xs hover:text-ivory"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setArchiveConfirm(inv.id)}
                          className="text-ivory/25 hover:text-danger transition-colors px-1"
                          title="Archivar invitación"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Booking form modal */}
        {showBookingForm && (
          <BookingForm
            onClose={() => setShowBookingForm(false)}
            onSuccess={() => { setShowBookingForm(false); loadBookings() }}
          />
        )}

        {/* Invitation wizard (create or edit) */}
        {showInvitationWizard && (
          <InvitationWizard
            onClose={closeWizard}
            onSave={() => { loadInvitations(); closeWizard() }}
            ownerName={user?.name}
            ownerEmail={user?.email}
            mode="client"
            initialData={editInvitation ?? undefined}
          />
        )}

        {/* Guest list panel */}
        {guestPanelInv && (
          <GuestListPanel
            invitationId={guestPanelInv.id}
            invitationTitle={guestPanelInv.title}
            onClose={() => setGuestPanelInv(null)}
          />
        )}
      </div>
    </div>
  )
}

// ─── Booking Form ─────────────────────────────────────────────────────────────

function BookingForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    service: '',
    eventDate: '',
    eventType: '',
    venue: '',
    guestCount: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const services = [
    'Bodas & Celebraciones', 'Eventos Corporativos', 'Retratos & Sesiones',
    'XV Años & Graduaciones', 'Fotografía Editorial', 'Video + Foto Combo',
  ]
  const eventTypes = [
    'Boda', 'XV Años', 'Cumpleaños', 'Graduación', 'Corporativo', 'Sesión de retratos', 'Otro',
  ]

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await api.post('/client/bookings', form)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-lg glass rounded-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-cormorant text-xl text-ivory">Nueva Reserva</h3>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Servicio', field: 'service', type: 'select', options: services },
            { label: 'Tipo de evento', field: 'eventType', type: 'select', options: eventTypes },
            { label: 'Fecha del evento', field: 'eventDate', type: 'date' },
            { label: 'Lugar del evento', field: 'venue', type: 'text', placeholder: 'Hacienda San Miguel...' },
            { label: 'Número de invitados', field: 'guestCount', type: 'number', placeholder: '150' },
          ].map(({ label, field, type, options, placeholder }) => (
            <div key={field}>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">{label}</label>
              {type === 'select' ? (
                <select
                  value={form[field as keyof typeof form]}
                  onChange={set(field)}
                  required={['service', 'eventType', 'eventDate'].includes(field)}
                  className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none"
                  style={{ backgroundColor: '#111111' }}
                >
                  <option value="" style={{ backgroundColor: '#111111', color: '#F5F0E8' }}>Seleccionar...</option>
                  {options?.map(o => (
                    <option key={o} value={o} style={{ backgroundColor: '#111111', color: '#F5F0E8' }}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={set(field)}
                  placeholder={placeholder}
                  required={['service', 'eventType', 'eventDate'].includes(field)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
                />
              )}
            </div>
          ))}

          <div>
            <label className="block text-ivory/60 text-xs font-dm mb-1.5">Notas adicionales</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Cuéntanos más sobre tu evento..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2 text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-2.5 text-sm">
              {isLoading ? 'Enviando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
