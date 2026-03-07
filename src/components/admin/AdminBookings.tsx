import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, User, MapPin, Users, DollarSign, X,
  ChevronRight, RefreshCw, FileText,
} from 'lucide-react'
import api from '../../api/client'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface BookingClient {
  id: string
  name: string
  email: string
  phone?: string
}

interface Booking {
  id: string
  service: string
  eventDate: string
  eventType: string
  venue?: string
  guestCount?: number
  budget?: number
  status: string
  notes?: string
  adminNotes?: string
  totalPrice?: number
  depositPaid: boolean
  archivedAt?: string | null
  archiveReason?: string | null
  createdAt: string
  client: BookingClient
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:      { label: 'Pendiente',       color: 'text-yellow-400 bg-yellow-400/10', dot: 'bg-yellow-400' },
  CONFIRMED:    { label: 'Confirmado',      color: 'text-green-400 bg-green-400/10',   dot: 'bg-green-400' },
  DEPOSIT_PAID: { label: 'Depósito pagado', color: 'text-teal-400 bg-teal-400/10',     dot: 'bg-teal-400' },
  IN_PROGRESS:  { label: 'En progreso',     color: 'text-blue-400 bg-blue-400/10',     dot: 'bg-blue-400' },
  COMPLETED:    { label: 'Completado',      color: 'text-emerald-400 bg-emerald-400/10', dot: 'bg-emerald-400' },
  CANCELLED:    { label: 'Cancelado',       color: 'text-red-400 bg-red-400/10',       dot: 'bg-red-400' },
}

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: '',             label: 'Todas' },
  { key: 'PENDING',      label: 'Pendientes' },
  { key: 'CONFIRMED',    label: 'Confirmadas' },
  { key: 'DEPOSIT_PAID', label: 'Depósito' },
  { key: 'IN_PROGRESS',  label: 'En progreso' },
  { key: 'COMPLETED',    label: 'Completadas' },
  { key: 'CANCELLED',    label: 'Canceladas' },
]

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active')
  const [selected, setSelected] = useState<Booking | null>(null)

  useEffect(() => { load() }, [filterStatus, viewMode])

  async function load() {
    setIsLoading(true)
    try {
      const params = filterStatus ? `?status=${filterStatus}&limit=50` : '?limit=50'
      const base = viewMode === 'history' ? '/admin/history/bookings' : '/admin/bookings'
      const res = await api.get<{ data: Booking[] }>(`${base}${params}`)
      setBookings(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  function openDetail(b: Booking) {
    if (viewMode !== 'active') return
    setSelected(b)
  }
  function closeDetail() { setSelected(null) }

  function onSaved(updated: Booking) {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
    setSelected(updated)
  }

  const counts = FILTER_TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t.key] = t.key === ''
      ? bookings.length
      : bookings.filter(b => b.status === t.key).length
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-ivory/50 text-sm font-dm">
          {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
          {viewMode === 'history' ? ' en historial' : ''}
          {filterStatus && ` · ${STATUS_CONFIG[filterStatus]?.label}`}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => { setViewMode('active'); setSelected(null) }}
              className={`px-2.5 py-1.5 rounded text-xs font-dm transition-colors ${
                viewMode === 'active' ? 'bg-gold/20 text-gold' : 'text-ivory/50 hover:text-ivory'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => { setViewMode('history'); setSelected(null) }}
              className={`px-2.5 py-1.5 rounded text-xs font-dm transition-colors ${
                viewMode === 'history' ? 'bg-gold/20 text-gold' : 'text-ivory/50 hover:text-ivory'
              }`}
            >
              Historial
            </button>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-ivory/50 hover:text-gold text-sm font-dm transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-colors ${
              filterStatus === key
                ? 'bg-gold/20 text-gold'
                : 'bg-white/5 text-ivory/50 hover:text-ivory hover:bg-white/10'
            }`}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                filterStatus === key ? 'bg-gold text-black' : 'bg-white/10 text-ivory/60'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass rounded-xl border border-white/5 p-12 text-center">
          <CalendarDays className="mx-auto text-ivory/20 mb-4" size={40} />
          <p className="text-ivory/40 font-dm">No hay reservas{filterStatus ? ' con ese estado' : ''}</p>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {bookings.map(b => {
              const st = STATUS_CONFIG[b.status] || STATUS_CONFIG['PENDING']
              return (
                <div
                  key={b.id}
                  onClick={() => openDetail(b)}
                  className={`w-full text-left glass rounded-xl border border-white/5 p-4 space-y-3 ${
                    viewMode === 'active' ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-ivory text-sm font-dm truncate">{b.client.name}</p>
                      <p className="text-ivory/45 text-xs truncate">{b.client.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-dm whitespace-nowrap ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-dm">
                    <p className="text-ivory/75 truncate">{b.service}</p>
                    <p className="text-ivory/50">{b.eventType} · {new Date(b.eventDate).toLocaleDateString('es-MX', { dateStyle: 'medium' })}</p>
                    {b.archivedAt && (
                      <p className="text-ivory/35 text-xs">Archivada: {new Date(b.archivedAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}</p>
                    )}
                    <p className="text-gold">
                      {b.totalPrice != null ? `$${b.totalPrice.toLocaleString('es-MX')} MXN` : 'Sin precio definido'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-ivory/35 text-xs">
                    <span>Invitados: {b.guestCount ?? '-'}</span>
                    {viewMode === 'active' && (
                      <span className="inline-flex items-center gap-1 text-gold/80">Ver detalle <ChevronRight size={13} /></span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Cliente', 'Servicio', 'Tipo', 'Fecha evento', 'Invitados', 'Estado', 'Total', ''].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-ivory/40 text-xs font-dm uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map(b => {
                    const st = STATUS_CONFIG[b.status] || STATUS_CONFIG['PENDING']
                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-white/3 transition-colors group ${viewMode === 'active' ? 'cursor-pointer' : ''}`}
                        onClick={() => openDetail(b)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-ivory text-sm font-dm">{b.client.name}</p>
                          <p className="text-ivory/40 text-xs">{b.client.email}</p>
                        </td>
                        <td className="px-4 py-3 text-ivory/80 text-sm font-dm max-w-[140px] truncate">
                          {b.service}
                        </td>
                        <td className="px-4 py-3 text-ivory/60 text-sm font-dm whitespace-nowrap">
                          {b.eventType}
                        </td>
                        <td className="px-4 py-3 text-ivory/60 text-xs font-dm whitespace-nowrap">
                          {new Date(b.eventDate).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                          {b.archivedAt && (
                            <p className="text-ivory/35 mt-1">
                              Archivada: {new Date(b.archivedAt).toLocaleDateString('es-MX')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ivory/50 text-sm font-dm text-center">
                          {b.guestCount ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-dm whitespace-nowrap ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gold text-sm font-dm whitespace-nowrap">
                          {b.totalPrice != null
                            ? `$${b.totalPrice.toLocaleString('es-MX')} MXN`
                            : <span className="text-ivory/30">-</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {viewMode === 'active' && (
                            <ChevronRight
                              size={16}
                              className="text-ivory/20 group-hover:text-gold transition-colors"
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && viewMode === 'active' && (
          <BookingDetail
            booking={selected}
            onClose={closeDetail}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// â”€â”€â”€ Detail Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function BookingDetail({
  booking,
  onClose,
  onSaved,
}: {
  booking: Booking
  onClose: () => void
  onSaved: (b: Booking) => void
}) {
  const [form, setForm] = useState({
    status: booking.status,
    totalPrice: booking.totalPrice?.toString() ?? '',
    depositPaid: booking.depositPaid,
    adminNotes: booking.adminNotes ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const res = await api.patch<{ data: Booking }>(`/admin/bookings/${booking.id}`, {
        status: form.status,
        totalPrice: form.totalPrice ? parseFloat(form.totalPrice) : null,
        depositPaid: form.depositPaid,
        adminNotes: form.adminNotes || null,
      })
      onSaved(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG['PENDING']

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#111111] border-l border-white/10 flex flex-col overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div>
            <p className="label-caps text-gold text-xs">Reserva</p>
            <h3 className="font-cormorant text-xl text-ivory mt-0.5">{booking.client.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ivory/40 hover:text-ivory transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-dm ${st.color}`}>
            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
            {st.label}
          </span>

          {/* Info cards */}
          <div className="space-y-3">
            <InfoRow icon={User} label="Cliente">
              <p className="text-ivory text-sm">{booking.client.name}</p>
              <p className="text-ivory/50 text-xs">{booking.client.email}</p>
              {booking.client.phone && (
                <p className="text-ivory/50 text-xs">{booking.client.phone}</p>
              )}
            </InfoRow>

            <InfoRow icon={CalendarDays} label="Evento">
              <p className="text-ivory text-sm">{booking.service}</p>
              <p className="text-ivory/50 text-xs">{booking.eventType}</p>
              <p className="text-ivory/50 text-xs">
                {new Date(booking.eventDate).toLocaleDateString('es-MX', { dateStyle: 'long' })}
              </p>
            </InfoRow>

            {booking.venue && (
              <InfoRow icon={MapPin} label="Lugar">
                <p className="text-ivory text-sm">{booking.venue}</p>
              </InfoRow>
            )}

            {booking.guestCount != null && (
              <InfoRow icon={Users} label="Invitados">
                <p className="text-ivory text-sm">{booking.guestCount} personas</p>
              </InfoRow>
            )}

            {booking.budget != null && (
              <InfoRow icon={DollarSign} label="Presupuesto cliente">
                <p className="text-ivory text-sm">${booking.budget.toLocaleString('es-MX')} MXN</p>
              </InfoRow>
            )}

            {booking.notes && (
              <InfoRow icon={FileText} label="Notas del cliente">
                <p className="text-ivory/70 text-sm leading-relaxed">{booking.notes}</p>
              </InfoRow>
            )}

            <div className="text-ivory/30 text-xs font-dm pt-1">
              Creada el {new Date(booking.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}
            </div>
          </div>

          {/* â”€â”€ Admin edit form â”€â”€ */}
          <div className="border-t border-white/5 pt-5 space-y-4">
            <p className="label-caps text-gold text-xs">Gestión Admin</p>

            {/* Status */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <option value="PENDING"      style={{ backgroundColor: '#1a1a1a' }}>Pendiente</option>
                <option value="CONFIRMED"    style={{ backgroundColor: '#1a1a1a' }}>Confirmado</option>
                <option value="DEPOSIT_PAID" style={{ backgroundColor: '#1a1a1a' }}>Depósito pagado</option>
                <option value="IN_PROGRESS"  style={{ backgroundColor: '#1a1a1a' }}>En progreso</option>
                <option value="COMPLETED"    style={{ backgroundColor: '#1a1a1a' }}>Completado</option>
                <option value="CANCELLED"    style={{ backgroundColor: '#1a1a1a' }}>Cancelado</option>
              </select>
            </div>

            {/* Total price */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Precio total (MXN)</label>
              <input
                type="number"
                value={form.totalPrice}
                onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))}
                placeholder="Ej: 25000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
              />
            </div>

            {/* Deposit paid */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.depositPaid}
                  onChange={e => setForm(f => ({ ...f, depositPaid: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  form.depositPaid ? 'bg-gold' : 'bg-white/10'
                }`} />
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  form.depositPaid ? 'left-5' : 'left-1'
                }`} />
              </div>
              <span className="text-ivory/70 text-sm font-dm group-hover:text-ivory transition-colors">
                Depósito recibido
              </span>
            </label>

            {/* Admin notes */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Notas internas</label>
              <textarea
                value={form.adminNotes}
                onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
                placeholder="Notas visibles solo para ti..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
            )}
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="btn-outline flex-1 py-2.5 text-sm"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1 py-2.5 text-sm"
          >
            {isSaving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

// â”€â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 p-3 bg-white/3 rounded-lg border border-white/5">
      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gold/10 flex items-center justify-center mt-0.5">
        <Icon size={13} className="text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ivory/40 text-[10px] font-dm uppercase tracking-wider mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

