import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Trash2, Plus, X } from 'lucide-react'
import api from '../../api/client'
import { ApiInvitationGuest } from '../invitations/invitationTypes'

interface Props {
  invitationId: string
  invitationTitle: string
  onClose: () => void
}

const RESPONSE_CONFIG = {
  ACCEPTED:  { label: 'Confirmó',  color: 'text-green-400', bg: 'bg-green-400/10' },
  DECLINED:  { label: 'Declinó',   color: 'text-red-400',   bg: 'bg-red-400/10' },
  PENDING:   { label: 'Pendiente', color: 'text-ivory/50',  bg: 'bg-white/5' },
}

export default function GuestListPanel({ invitationId, invitationTitle, onClose }: Props) {
  const [guests, setGuests] = useState<ApiInvitationGuest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [guestInput, setGuestInput] = useState('')
  const [msgInput, setMsgInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const base = `/client/invitations/${invitationId}`

  async function loadGuests() {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: ApiInvitationGuest[] }>(`${base}/guests`)
      setGuests(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadGuests() }, [invitationId])

  async function handleAdd() {
    if (!guestInput.trim() || isAdding) return
    setIsAdding(true)
    try {
      await api.post(`${base}/guests`, { 
        guests: [{ 
          name: guestInput.trim(), 
          personalizedMessage: msgInput.trim() || undefined 
        }] 
      })
      setGuestInput('')
      setMsgInput('')
      await loadGuests()
    } catch { /* silent */ } finally {
      setIsAdding(false)
    }
  }

  async function handleDelete(gid: string) {
    try {
      await api.delete(`${base}/guests/${gid}`)
      setDeleteConfirm(null)
      setGuests(prev => prev.filter(g => g.id !== gid))
    } catch { /* silent */ }
  }

  async function handleSeedGuests() {
    if (isSeeding) return
    setIsSeeding(true)
    try {
      await api.post(`${base}/guests/dev-seed`, {})
      await loadGuests()
    } catch {
      // silent
    } finally {
      setIsSeeding(false)
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/g/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const accepted  = guests.filter(g => g.response === 'ACCEPTED').length
  const declined  = guests.filter(g => g.response === 'DECLINED').length
  const pending   = guests.filter(g => g.response === 'PENDING').length

  const ic = 'flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/20 focus:border-gold/50 focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-lg glass rounded-2xl border border-white/10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gold" />
            <div>
              <p className="label-caps text-gold text-xs">Lista de invitados</p>
              <h3 className="font-cormorant text-lg text-ivory truncate max-w-[280px]">{invitationTitle}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-3 border-b border-white/5 flex gap-4 text-xs font-dm">
          <span className="text-green-400">{accepted} Confirmados</span>
          <span className="text-ivory/40">{pending} En espera</span>
          <span className="text-red-400">{declined} No asistiran</span>
          <span className="text-ivory/25 ml-auto">{guests.length} total</span>
        </div>

        {/* Add guest */}
        <div className="px-6 py-4 border-b border-white/5 space-y-3">
          <div className="flex gap-2">
            <input
              value={guestInput}
              onChange={e => setGuestInput(e.target.value)}
              className={ic}
              placeholder="Nombre del invitado"
            />
            <button
              onClick={handleAdd}
              disabled={isAdding || !guestInput.trim()}
              className="btn-primary px-4 py-2 text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>
          <input
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            className={ic}
            placeholder="Mensaje breve personalizado (opcional)"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSeedGuests}
              disabled={isSeeding}
              className="text-xs font-dm text-ivory/50 hover:text-gold transition-colors disabled:opacity-40"
            >
              {isSeeding ? 'Creando pruebas...' : 'Crear 5 invitados de prueba'}
            </button>
          </div>
        </div>

        {/* Guest list */}
        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-ivory/20 mb-3" />
              <p className="text-ivory/40 text-sm font-dm">Sin invitados aún</p>
              <p className="text-ivory/30 text-xs font-dm mt-1">Agrega nombres y comparte los links individuales.</p>
            </div>
          ) : (
            <table className="w-full text-sm font-dm">
              <thead>
                <tr className="text-ivory/30 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Respondió</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {guests.map(g => {
                  const cfg = RESPONSE_CONFIG[g.response as keyof typeof RESPONSE_CONFIG] ?? RESPONSE_CONFIG.PENDING
                  return (
                    <tr key={g.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-3 text-ivory">{g.name}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ivory/30 text-xs">
                        {g.respondedAt
                          ? new Date(g.respondedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                          : '–'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => copyLink(g.token)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                              copied === g.token ? 'text-green-400' : 'text-ivory/40 hover:text-ivory'
                            }`}
                            title="Copiar link"
                          >
                            {copied === g.token ? <Check size={11} /> : <Copy size={11} />}
                            Link
                          </button>
                          {deleteConfirm === g.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(g.id)}
                                className="text-red-400 text-xs hover:text-red-300"
                              >
                                ¿Eliminar?
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-ivory/30 hover:text-ivory"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(g.id)}
                              className="text-ivory/25 hover:text-danger transition-colors p-1"
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="btn-outline px-5 py-2 text-xs">
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
