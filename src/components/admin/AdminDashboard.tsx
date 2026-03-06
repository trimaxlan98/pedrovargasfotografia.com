import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, CalendarDays, Image,
  Users, Settings, LogOut, Clock, CheckCircle,
  TrendingUp, Menu, Mail
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'
import AdminInvitations from './AdminInvitations'
import AdminBookings from './AdminBookings'
import AdminPortfolio from './AdminPortfolio'
import AdminClients from './AdminClients'
import AdminSettings from './AdminSettings'

interface DashboardStats {
  totalContacts: number
  pendingContacts: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalClients: number
  totalPortfolio: number
}

interface ContactRequest {
  id: string
  name: string
  email: string
  service: string
  status: string
  createdAt: string
}

interface DashboardData {
  stats: DashboardStats
  recentContacts: ContactRequest[]
  recentBookings: Array<{
    id: string
    service: string
    eventDate: string
    status: string
    client: { name: string; email: string }
  }>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pendiente',     color: 'text-yellow-400 bg-yellow-400/10' },
  IN_PROGRESS: { label: 'En proceso',    color: 'text-blue-400 bg-blue-400/10' },
  RESPONDED:   { label: 'Respondido',    color: 'text-green-400 bg-green-400/10' },
  CLOSED:      { label: 'Cerrado',       color: 'text-gray-400 bg-gray-400/10' },
  CONFIRMED:   { label: 'Confirmado',    color: 'text-green-400 bg-green-400/10' },
  COMPLETED:   { label: 'Completado',    color: 'text-emerald-400 bg-emerald-400/10' },
  CANCELLED:   { label: 'Cancelado',     color: 'text-red-400 bg-red-400/10' },
  DEPOSIT_PAID:{ label: 'Depósito pagado', color: 'text-teal-400 bg-teal-400/10' },
}

type Section = 'dashboard' | 'contacts' | 'bookings' | 'portfolio' | 'clients' | 'invitations' | 'settings'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [section, setSection] = useState<Section>('dashboard')
  const [data, setData] = useState<DashboardData | null>(null)
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (section === 'contacts') loadContacts()
  }, [section])

  async function loadDashboard() {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: DashboardData }>('/admin/dashboard')
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadContacts() {
    try {
      const res = await api.get<{ data: ContactRequest[] }>('/admin/contacts')
      setContacts(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function updateContactStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/contacts/${id}`, { status })
      loadContacts()
    } catch (e) {
      console.error(e)
    }
  }

  const navItems: Array<{ id: Section; icon: React.ElementType; label: string; badge?: number }> = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'contacts',  icon: MessageSquare,  label: 'Contactos',  badge: data?.stats.pendingContacts },
    { id: 'bookings',  icon: CalendarDays,   label: 'Reservas',   badge: data?.stats.pendingBookings },
    { id: 'portfolio', icon: Image,          label: 'Portfolio' },
    { id: 'clients',   icon: Users,          label: 'Clientes' },
    { id: 'invitations', icon: Mail,         label: 'Invitaciones' },
    { id: 'settings',  icon: Settings,       label: 'Configuración' },
  ]

  return (
    <div className="min-h-dvh bg-near-black flex overflow-x-clip">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-white/5 flex flex-col
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <p className="label-caps text-gold text-xs">Panel Admin</p>
          <h1 className="font-cormorant text-xl text-ivory mt-1">Pedro Vargas Fotografía</h1>
          <p className="text-ivory/40 text-xs font-dm mt-1">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm transition-colors ${
                section === id
                  ? 'bg-gold/20 text-gold'
                  : 'text-ivory/60 hover:text-ivory hover:bg-white/5'
              }`}
            >
              <Icon size={17} />
              <span className="flex-1 text-left">{label}</span>
              {badge ? (
                <span className="bg-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {badge > 9 ? '9+' : badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm text-ivory/40 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar overlay móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-dvh">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-near-black/90 backdrop-blur-sm border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-ivory/60 hover:text-ivory"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div>
            <h2 className="font-cormorant text-lg text-ivory capitalize">
              {navItems.find(n => n.id === section)?.label}
            </h2>
            <p className="text-ivory/40 text-xs font-dm">Bienvenido, {user?.name}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {isLoading && section === 'dashboard' ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {section === 'dashboard' && data && <DashboardView data={data} />}
              {section === 'contacts' && (
                <ContactsView
                  contacts={contacts}
                  onRefresh={loadContacts}
                  onUpdateStatus={updateContactStatus}
                />
              )}
              {section === 'invitations' && <AdminInvitations />}
              {section === 'bookings'    && <AdminBookings />}
              {section === 'portfolio'   && <AdminPortfolio />}
              {section === 'clients'     && <AdminClients />}
              {section === 'settings'    && <AdminSettings />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function DashboardView({ data }: { data: DashboardData }) {
  const stats = [
    { label: 'Contactos totales',  value: data.stats.totalContacts,   icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Pendientes',         value: data.stats.pendingContacts, icon: Clock,         color: 'text-yellow-400' },
    { label: 'Reservas',           value: data.stats.totalBookings,   icon: CalendarDays,  color: 'text-purple-400' },
    { label: 'Confirmadas',        value: data.stats.confirmedBookings, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Clientes',           value: data.stats.totalClients,    icon: Users,         color: 'text-teal-400' },
    { label: 'Portfolio',          value: data.stats.totalPortfolio,  icon: Image,         color: 'text-gold' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            className="glass rounded-xl p-4 border border-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Icon className={`${color} mb-2`} size={20} />
            <p className={`text-2xl font-cormorant font-bold ${color}`}>{value}</p>
            <p className="text-ivory/50 text-xs font-dm mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recientes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contactos recientes */}
        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-cormorant text-lg text-ivory">Solicitudes Recientes</h3>
            <TrendingUp size={16} className="text-gold" />
          </div>
          <div className="divide-y divide-white/5">
            {data.recentContacts.map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-xs font-semibold">{c.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ivory text-sm font-dm truncate">{c.name}</p>
                  <p className="text-ivory/40 text-xs truncate">{c.service}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Reservas recientes */}
        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-cormorant text-lg text-ivory">Reservas Recientes</h3>
            <CalendarDays size={16} className="text-gold" />
          </div>
          <div className="divide-y divide-white/5">
            {data.recentBookings.map(b => (
              <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-ivory text-sm font-dm truncate">{b.client.name}</p>
                  <p className="text-ivory/40 text-xs truncate">{b.service}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {data.recentBookings.length === 0 && (
              <p className="px-5 py-6 text-ivory/30 text-sm text-center font-dm">Sin reservas aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactsView({
  contacts,
  onRefresh,
  onUpdateStatus,
}: {
  contacts: ContactRequest[]
  onRefresh: () => void
  onUpdateStatus: (id: string, status: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-ivory/60 text-sm font-dm">{contacts.length} solicitudes</p>
        <button onClick={onRefresh} className="text-gold hover:text-gold-light text-sm font-dm">
          Actualizar
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="glass rounded-xl border border-white/5 p-10 text-center text-ivory/30 font-dm text-sm">
          No hay solicitudes de contacto
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {contacts.map(c => (
              <div key={c.id} className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-ivory text-sm font-dm truncate">{c.name}</p>
                    <p className="text-ivory/50 text-xs truncate">{c.email}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-dm">
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Servicio</p>
                    <p className="text-ivory/75">{c.service}</p>
                  </div>
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Fecha</p>
                    <p className="text-ivory/75">{new Date(c.createdAt).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>

                <select
                  value={c.status}
                  onChange={e => onUpdateStatus(c.id, e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg text-ivory/80 text-xs px-3 py-2"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En proceso</option>
                  <option value="RESPONDED">Respondido</option>
                  <option value="CLOSED">Cerrado</option>
                </select>
              </div>
            ))}
          </div>

          <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Nombre', 'Email', 'Servicio', 'Fecha', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-ivory/40 text-xs font-dm uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contacts.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-ivory text-sm font-dm">{c.name}</td>
                      <td className="px-4 py-3 text-ivory/60 text-sm font-dm">{c.email}</td>
                      <td className="px-4 py-3 text-ivory/80 text-sm font-dm">{c.service}</td>
                      <td className="px-4 py-3 text-ivory/50 text-xs font-dm">
                        {new Date(c.createdAt).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={c.status}
                          onChange={e => onUpdateStatus(c.id, e.target.value)}
                          className="bg-surface border border-white/10 rounded text-ivory/80 text-xs px-2 py-1"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="IN_PROGRESS">En proceso</option>
                          <option value="RESPONDED">Respondido</option>
                          <option value="CLOSED">Cerrado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] || { label: status, color: 'text-ivory/50 bg-white/5' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-dm ${s.color}`}>
      {s.label}
    </span>
  )
}
