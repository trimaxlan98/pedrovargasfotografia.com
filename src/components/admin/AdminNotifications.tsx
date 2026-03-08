import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, UserPlus, LogIn, FileCheck, Mail, CalendarDays,
  X, Trash2, RefreshCw, CheckCheck,
} from 'lucide-react'
import api from '../../api/client'

interface ActivityLog {
  id: string
  userId: string
  userName: string
  userEmail: string
  action: string
  detail?: string
  isRead: boolean
  createdAt: string
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  REGISTER:           { label: 'Nuevo cliente',          icon: UserPlus,    color: 'text-green-400',  bg: 'bg-green-400/10' },
  LOGIN:              { label: 'Inicio de sesión',        icon: LogIn,       color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  TERMS_ACCEPTED:     { label: 'Términos aceptados',      icon: FileCheck,   color: 'text-teal-400',   bg: 'bg-teal-400/10' },
  INVITATION_CREATED: { label: 'Invitación creada',       icon: Mail,        color: 'text-gold',       bg: 'bg-gold/10' },
  INVITATION_UPDATED: { label: 'Invitación actualizada',  icon: Mail,        color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  INVITATION_DELETED: { label: 'Invitación eliminada',    icon: Trash2,      color: 'text-red-400',    bg: 'bg-red-400/10' },
  BOOKING_CREATED:    { label: 'Nueva reserva',           icon: CalendarDays,color: 'text-purple-400', bg: 'bg-purple-400/10' },
  BOOKING_CANCELLED:  { label: 'Reserva cancelada',       icon: X,           color: 'text-red-400',    bg: 'bg-red-400/10' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export default function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get<{ data: { logs: ActivityLog[]; unreadCount: number } }>('/admin/notifications')
      setLogs(res.data.logs)
      setUnreadCount(res.data.unreadCount)
    } catch { /* silent */ } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Initial load + poll every 30 s
  useEffect(() => {
    loadNotifications()
    const id = setInterval(() => loadNotifications(true), 30_000)
    return () => clearInterval(id)
  }, [loadNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function markAllRead() {
    try {
      await api.patch('/admin/notifications/mark-all-read')
      setLogs(prev => prev.map(l => ({ ...l, isRead: true })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  async function markRead(id: string) {
    const log = logs.find(l => l.id === id)
    if (!log || log.isRead) return
    try {
      await api.patch(`/admin/notifications/${id}/read`)
      setLogs(prev => prev.map(l => l.id === id ? { ...l, isRead: true } : l))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-ivory/60 hover:text-gold transition-colors hover:bg-white/5"
        aria-label="Notificaciones de actividad"
        title="Actividad de usuarios"
      >
        <Bell size={17} className={open ? 'text-gold' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none pointer-events-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-11 w-[340px] glass border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-2">
              <div>
                <p className="text-ivory text-sm font-dm font-medium">Actividad de usuarios</p>
                <p className="text-ivory/40 text-[11px] font-dm">
                  {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadNotifications()}
                  disabled={loading}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-ivory/40 hover:text-ivory hover:bg-white/5 transition-colors"
                  title="Actualizar"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-gold hover:text-gold/80 font-dm transition-colors px-2 py-1 rounded-lg hover:bg-gold/5"
                    title="Marcar todo como leído"
                  >
                    <CheckCheck size={12} />
                    Leer todo
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto divide-y divide-white/[0.04]" style={{ maxHeight: '360px' }}>
              {logs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto text-ivory/15 mb-3" size={28} />
                  <p className="text-ivory/30 text-sm font-dm">Sin actividad registrada</p>
                </div>
              ) : (
                logs.map(log => {
                  const cfg = ACTION_CONFIG[log.action] ?? {
                    label: log.action, icon: Bell,
                    color: 'text-ivory/50', bg: 'bg-white/5',
                  }
                  const Icon = cfg.icon
                  return (
                    <button
                      key={log.id}
                      onClick={() => markRead(log.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${
                        !log.isRead ? 'bg-white/[0.025]' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={13} className={cfg.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-dm font-medium truncate ${cfg.color}`}>
                            {cfg.label}
                          </p>
                          {!log.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-ivory/70 text-[11px] font-dm truncate">{log.userName}</p>
                        <p className="text-ivory/35 text-[10px] font-dm truncate">{log.userEmail}</p>
                        {log.detail && (
                          <p className="text-ivory/40 text-[10px] font-dm mt-0.5 line-clamp-1">{log.detail}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-ivory/25 text-[10px] font-dm flex-shrink-0 mt-0.5">
                        {timeAgo(log.createdAt)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer summary */}
            {logs.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/5 text-center">
                <p className="text-ivory/25 text-[10px] font-dm">
                  Mostrando los últimos {logs.length} eventos · Actualización cada 30 s
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
