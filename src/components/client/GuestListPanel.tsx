import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Trash2, Plus, X, Pencil, Save, MessageSquare, ExternalLink } from 'lucide-react'
import api from '../../api/client'
import { ApiInvitationGuest } from '../invitations/invitationTypes'

interface Props {
  invitationId: string
  invitationTitle: string
  onClose: () => void
  mode?: 'client' | 'admin'
}

const RESPONSE_CONFIG = {
  ACCEPTED: { label: 'Confirmó',  color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-400/10' },
  DECLINED: { label: 'Declinó',   color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-100 dark:bg-red-400/10'    },
  PENDING:  { label: 'Pendiente', color: 'text-gray-500 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-white/5'      },
}

export default function GuestListPanel({ invitationId, invitationTitle, onClose, mode = 'client' }: Props) {
  const [guests, setGuests]               = useState<ApiInvitationGuest[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [guestInput, setGuestInput]       = useState('')
  const [msgInput, setMsgInput]           = useState('')
  const [isAdding, setIsAdding]           = useState(false)
  const [isSeeding, setIsSeeding]         = useState(false)
  const [copied, setCopied]               = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editMsg, setEditMsg]             = useState('')
  const [savingId, setSavingId]           = useState<string | null>(null)

  const base = `/${mode === 'admin' ? 'admin' : 'client'}/invitations/${invitationId}`

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
        guests: [{ name: guestInput.trim(), personalizedMessage: msgInput.trim() || undefined }],
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

  async function handleSaveMsg(gid: string) {
    setSavingId(gid)
    try {
      await api.patch(`${base}/guests/${gid}`, { personalizedMessage: editMsg.trim() || null })
      setGuests(prev =>
        prev.map(g => g.id === gid ? { ...g, personalizedMessage: editMsg.trim() || undefined } : g)
      )
      setEditingId(null)
    } catch { /* silent */ } finally {
      setSavingId(null)
    }
  }

  function startEdit(g: ApiInvitationGuest) {
    setEditingId(g.id)
    setEditMsg(g.personalizedMessage ?? '')
  }

  async function handleSeedGuests() {
    if (isSeeding) return
    setIsSeeding(true)
    try {
      await api.post(`${base}/guests/dev-seed`, {})
      await loadGuests()
    } catch { /* silent */ } finally {
      setIsSeeding(false)
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/g/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const accepted = guests.filter(g => g.response === 'ACCEPTED').length
  const declined = guests.filter(g => g.response === 'DECLINED').length
  const pending  = guests.filter(g => g.response === 'PENDING').length

  // input: fondo y texto que funciona en ambos modos
  const ic = [
    'flex-1 rounded-lg px-4 py-2.5 text-sm font-dm',
    'bg-gray-100 dark:bg-[#2a2a2a]',
    'border border-gray-300 dark:border-white/10',
    'text-gray-900 dark:text-gray-100',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:border-gold/50 focus:outline-none',
  ].join(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl
                   bg-white dark:bg-[#181818]
                   border border-gray-200 dark:border-white/10"
        style={{ maxHeight: '92vh' }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0
                        border-b border-gray-200 dark:border-white/8">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gold" />
            <div>
              <p className="label-caps text-gold text-xs">Lista de invitados</p>
              <h3 className="font-cormorant text-lg text-gray-900 dark:text-gray-100 truncate max-w-[340px]">
                {invitationTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-2.5 flex gap-4 text-xs font-dm flex-shrink-0
                        border-b border-gray-200 dark:border-white/8">
          <span className="text-green-600 dark:text-green-400">{accepted} Confirmados</span>
          <span className="text-gray-500 dark:text-gray-400">{pending} En espera</span>
          <span className="text-red-500 dark:text-red-400">{declined} No asistirán</span>
          <span className="text-gray-400 dark:text-gray-500 ml-auto">{guests.length} total</span>
        </div>

        {/* Agregar invitado */}
        <div className="px-6 py-4 space-y-2 flex-shrink-0
                        border-b border-gray-200 dark:border-white/8">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-dm uppercase tracking-wider mb-2">
            Agregar invitado
          </p>
          <div className="flex gap-2">
            <input
              value={guestInput}
              onChange={e => setGuestInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
              className={ic}
              placeholder="Nombre del invitado o familia"
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
          <div className="flex gap-2 items-start">
            <MessageSquare size={14} className="text-gray-400 dark:text-gray-500 mt-2.5 flex-shrink-0" />
            <input
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              className={`${ic} flex-1`}
              placeholder="Mensaje personalizado para este invitado (opcional)"
            />
          </div>
          {mode !== 'admin' && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSeedGuests}
                disabled={isSeeding}
                className="text-xs font-dm text-gray-400 dark:text-gray-500 hover:text-gold transition-colors disabled:opacity-40"
              >
                {isSeeding ? 'Creando pruebas…' : 'Crear 5 invitados de prueba'}
              </button>
            </div>
          )}
        </div>

        {/* Lista de invitados */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-dm">Sin invitados aún</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-dm mt-1">
                Agrega nombres y comparte los links individuales para que cada invitado vea su invitación personalizada.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {guests.map(g => {
                const cfg       = RESPONSE_CONFIG[g.response as keyof typeof RESPONSE_CONFIG] ?? RESPONSE_CONFIG.PENDING
                const isEditing = editingId === g.id
                const isSaving  = savingId === g.id

                return (
                  <div
                    key={g.id}
                    className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Nombre + estado */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-900 dark:text-gray-100 text-sm font-dm">{g.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-dm ${cfg.color} ${cfg.bg}`}>
                            {cfg.label}
                          </span>
                          {g.respondedAt && (
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-dm">
                              {new Date(g.respondedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>

                        {/* Mensaje personalizado o editor */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              autoFocus
                              value={editMsg}
                              onChange={e => setEditMsg(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') { e.preventDefault(); handleSaveMsg(g.id) }
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              placeholder="Escribe un mensaje para este invitado…"
                              className="flex-1 rounded-lg px-3 py-1.5 text-xs
                                         bg-gray-100 dark:bg-[#2a2a2a]
                                         border border-gold/40
                                         text-gray-900 dark:text-gray-100
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:border-gold/70 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveMsg(g.id)}
                              disabled={isSaving}
                              className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 px-2 py-1.5 rounded-lg hover:bg-gold/5 disabled:opacity-40"
                            >
                              <Save size={12} />
                              {isSaving ? '…' : 'Guardar'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-400 dark:text-gray-500 text-xs font-dm italic min-w-0 truncate">
                              {g.personalizedMessage || '— sin mensaje personalizado'}
                            </p>
                            <button
                              onClick={() => startEdit(g)}
                              className="text-gray-300 dark:text-gray-600 hover:text-gold transition-colors flex-shrink-0"
                              title="Editar mensaje"
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Acciones: Ver · Link · Eliminar */}
                      <div className="flex items-center gap-1 flex-shrink-0">

                        {/* Ver invitación individual */}
                        <a
                          href={`/g/${g.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors
                                     text-gray-400 dark:text-gray-500 hover:text-gold dark:hover:text-gold"
                          title="Ver invitación personalizada"
                        >
                          <ExternalLink size={11} />
                          Ver
                        </a>

                        {/* Copiar link */}
                        <button
                          onClick={() => copyLink(g.token)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            copied === g.token
                              ? 'text-green-500 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                          title="Copiar link personal"
                        >
                          {copied === g.token ? <Check size={11} /> : <Copy size={11} />}
                          Link
                        </button>

                        {/* Eliminar */}
                        {deleteConfirm === g.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(g.id)}
                              className="text-red-500 dark:text-red-400 text-xs font-dm hover:text-red-700 dark:hover:text-red-300"
                            >
                              ¿Eliminar?
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(g.id)}
                            className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                            title="Eliminar invitado"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0
                        border-t border-gray-200 dark:border-white/8">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-dm">
            Cada link lleva al invitado a su invitación personalizada
          </p>
          <button onClick={onClose} className="btn-outline px-5 py-2 text-xs">
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
