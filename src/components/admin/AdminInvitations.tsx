import { useEffect, useState } from 'react'
import { Mail, Eye, Plus, Pencil, Copy, Check, ExternalLink, ToggleLeft, ToggleRight, Archive, RotateCcw, Users } from 'lucide-react'
import InvitationWizard from '../invitations/InvitationWizard'
import GuestListPanel from '../client/GuestListPanel'
import api from '../../api/client'
import { ApiInvitation } from '../invitations/invitationTypes'

type TypeFilter = 'all' | 'general' | 'individual'

export default function AdminInvitations() {
  const [invitations, setInvitations] = useState<ApiInvitation[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [editTarget, setEditTarget] = useState<ApiInvitation | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmArchive, setConfirmArchive] = useState<ApiInvitation | null>(null)
  const [archiveReason, setArchiveReason] = useState('')
  const [isArchiving, setIsArchiving] = useState(false)
  const [guestPanelInv, setGuestPanelInv] = useState<ApiInvitation | null>(null)

  useEffect(() => { refresh() }, [viewMode])

  const refresh = async () => {
    setIsLoading(true)
    try {
      const base = viewMode === 'archived' ? '/admin/invitations/archived' : '/admin/invitations'
      const res = await api.get<{ data: ApiInvitation[] }>(base)
      setInvitations(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!confirmArchive) return
    setIsArchiving(true)
    try {
      await api.post(`/admin/invitations/${confirmArchive.id}/archive`, { reason: archiveReason })
      setInvitations(prev => prev.filter(inv => inv.id !== confirmArchive.id))
      setConfirmArchive(null)
      setArchiveReason('')
    } catch {
      alert('Error al archivar')
    } finally {
      setIsArchiving(false)
    }
  }

  const handleUnarchive = async (id: string) => {
    try {
      await api.post(`/admin/invitations/${id}/unarchive`, {})
      setInvitations(prev => prev.filter(inv => inv.id !== id))
    } catch {
      alert('Error al restaurar')
    }
  }

  const openCreate = () => {
    setEditTarget(undefined)
    setShowWizard(true)
  }
  const openEdit = (inv: ApiInvitation) => {
    setEditTarget(inv)
    setShowWizard(true)
  }

  const closeWizard = () => { setShowWizard(false); setEditTarget(undefined) }

  const handleSave = () => { refresh(); closeWizard() }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invitacion/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const togglePublished = async (inv: ApiInvitation) => {
    try {
      await api.patch(`/admin/invitations/${inv.id}/toggle-published`)
      refresh()
    } catch { /* silent */ }
  }


  const filteredInvitations = invitations.filter(inv => {
    if (typeFilter === 'all') return true
    return (inv.invitationType || 'general') === typeFilter
  })


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-ivory/50 text-sm font-dm">
          {filteredInvitations.length} invitación{filteredInvitations.length !== 1 ? 'es' : ''}
          {viewMode === 'archived' ? ' archivadas' : ''}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por tipo */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
            {([
              { id: 'all' as TypeFilter, label: 'Todas' },
              { id: 'general' as TypeFilter, label: 'General' },
              { id: 'individual' as TypeFilter, label: 'Individual' },
            ]).map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-2.5 py-1.5 rounded text-xs font-dm transition-colors ${
                  typeFilter === f.id ? 'bg-gold/20 text-gold' : 'text-ivory/50 hover:text-ivory'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`px-2.5 py-1.5 rounded text-xs font-dm transition-colors ${
                viewMode === 'active' ? 'bg-gold/20 text-gold' : 'text-ivory/50 hover:text-ivory'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setViewMode('archived')}
              className={`px-2.5 py-1.5 rounded text-xs font-dm transition-colors ${
                viewMode === 'archived' ? 'bg-gold/20 text-gold' : 'text-ivory/50 hover:text-ivory'
              }`}
            >
              Archivadas
            </button>
          </div>
          {viewMode === 'active' && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
            >
              <Plus size={16} />
              Nueva invitación
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="glass rounded-xl border border-white/5 p-12 text-center">
          <Mail className="mx-auto text-ivory/20 mb-4" size={40} />
          <p className="text-ivory/40 font-dm">
            {viewMode === 'active' ? 'No hay invitaciones creadas' : 'No hay invitaciones archivadas'}
          </p>
          {viewMode === 'active' && (
            <>
              <p className="text-ivory/30 text-sm font-dm mt-2">
                Crea una plantilla y asígnala a un cliente.
              </p>
              <button onClick={openCreate} className="btn-outline mt-5 px-6 py-2 text-sm">
                Crear primera invitación
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {filteredInvitations.map(inv => {
              const isIndividual = (inv.invitationType || 'general') === 'individual'
              const stats = (inv as any).guestStats
              return (
              <div key={inv.id} className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-ivory text-sm font-dm truncate">{inv.title}</p>
                      <span className={`flex-shrink-0 text-[0.55rem] font-dm uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        isIndividual ? 'bg-gold/15 text-gold' : 'bg-white/8 text-ivory/40'
                      }`}>
                        {isIndividual ? 'Individual' : 'General'}
                      </span>
                    </div>
                    <p className="text-ivory/45 text-xs truncate">
                      {inv.client?.name || inv.client?.email || 'Sin cliente'}
                    </p>
                  </div>
                  {viewMode === 'active' && (
                    <button
                      onClick={() => togglePublished(inv)}
                      className={`flex-shrink-0 flex items-center gap-1 text-xs font-dm px-2 py-1 rounded-full transition-colors ${
                        inv.isPublished
                          ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                          : 'bg-gray-400/10 text-gray-400 hover:bg-gray-400/20'
                      }`}
                      title="Cambiar estado"
                    >
                      {inv.isPublished ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                      {inv.isPublished ? 'Publicada' : 'Borrador'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-dm">
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Evento</p>
                    <p className="text-ivory/70 truncate">{inv.eventType}</p>
                  </div>
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Fecha</p>
                    <p className="text-ivory/70 truncate">{inv.eventDate}</p>
                  </div>
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Vistas</p>
                    <p className="text-ivory/70 inline-flex items-center gap-1"><Eye size={11} /> {inv.views}</p>
                  </div>
                </div>

                {isIndividual && stats && (
                  <div className="flex items-center gap-3 text-xs font-dm py-1.5 px-3 bg-white/3 rounded-lg border border-white/5">
                    <Users size={11} className="text-ivory/30" />
                    <span className="text-green-400">{stats.confirmed} confirm.</span>
                    <span className="text-ivory/40">{stats.pending} pend.</span>
                    <span className="text-red-400/70">{stats.declined} decl.</span>
                    <span className="text-ivory/25 ml-auto">{stats.total} total</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  {viewMode === 'active' ? (
                    <>
                      <button
                        onClick={() => openEdit(inv)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-ivory/70 border border-white/10 rounded-lg px-2 py-2 text-xs"
                        title="Editar invitación"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      {isIndividual && (
                        <button
                          onClick={() => setGuestPanelInv(inv)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-gold/70 border border-gold/20 rounded-lg px-2 py-2 text-xs"
                          title="Ver invitados"
                        >
                          <Users size={13} /> Invitados
                        </button>
                      )}
                      <button
                        onClick={() => copyLink(inv.shareToken)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 border border-white/10 rounded-lg px-2 py-2 text-xs ${
                          copied === inv.shareToken ? 'text-green-400' : 'text-ivory/70'
                        }`}
                        title="Copiar enlace"
                      >
                        {copied === inv.shareToken ? <Check size={13} /> : <Copy size={13} />} Copiar
                      </button>
                      <a
                        href={`/invitacion/${inv.shareToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-ivory/70 border border-white/10 rounded-lg px-2 py-2 text-xs"
                        title="Ver invitación"
                      >
                        <ExternalLink size={13} /> Ver
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUnarchive(inv.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-green-400 border border-green-400/20 bg-green-400/10 rounded-lg px-2 py-2 text-xs"
                    >
                      <RotateCcw size={13} /> Restaurar invitación
                    </button>
                  )}
                </div>

                {viewMode === 'active' && (
                  <button
                    onClick={() => setConfirmArchive(inv)}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-ivory/50 border border-white/10 rounded-lg px-3 py-2 text-xs hover:text-danger"
                    title="Archivar"
                  >
                    <Archive size={13} /> Archivar
                  </button>
                )}
              </div>
              )
            })}
          </div>

          <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Título', 'Cliente', 'Tipo / RSVP', 'Evento', 'Vistas', 'Estado', 'Acciones'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-ivory/40 text-xs font-dm uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvitations.map(inv => {
                    const isIndividual = (inv.invitationType || 'general') === 'individual'
                    const stats = (inv as any).guestStats
                    return (
                    <tr key={inv.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-4 py-3 text-ivory text-sm font-dm max-w-[160px] truncate">
                        {inv.title}
                      </td>
                      <td className="px-4 py-3 text-ivory/60 text-sm font-dm">
                        {inv.client?.name || inv.client?.email || (
                          <span className="text-ivory/30 italic">Sin cliente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[0.6rem] font-dm uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isIndividual ? 'bg-gold/15 text-gold' : 'bg-white/8 text-ivory/40'
                          }`}>
                            {isIndividual ? '✦ Individual' : '✉ General'}
                          </span>
                          {isIndividual && stats && (
                            <div className="flex items-center gap-2 text-[0.65rem] font-dm">
                              <span className="text-green-400">{stats.confirmed}✓</span>
                              <span className="text-ivory/35">{stats.pending}?</span>
                              <span className="text-red-400/60">{stats.declined}✗</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ivory/60 text-xs font-dm">
                        <div>{inv.eventType}</div>
                        <div className="text-ivory/35">{inv.eventDate}</div>
                      </td>
                      <td className="px-4 py-3 text-ivory/50 text-xs font-dm">
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {inv.views}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {viewMode === 'active' ? (
                          <button
                            onClick={() => togglePublished(inv)}
                            className={`flex items-center gap-1 text-xs font-dm px-2 py-1 rounded-full transition-colors ${
                              inv.isPublished
                                ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                                : 'bg-gray-400/10 text-gray-400 hover:bg-gray-400/20'
                            }`}
                            title="Clic para cambiar estado"
                          >
                            {inv.isPublished
                              ? <ToggleRight size={12} />
                              : <ToggleLeft size={12} />
                            }
                            {inv.isPublished ? 'Publicada' : 'Borrador'}
                          </button>
                        ) : (
                          <span className="badge-archived">Archivada</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {viewMode === 'active' ? (
                            <>
                              <button
                                onClick={() => openEdit(inv)}
                                className="text-ivory/40 hover:text-gold transition-colors"
                                title="Editar invitación"
                              >
                                <Pencil size={14} />
                              </button>

                              {isIndividual && (
                                <button
                                  onClick={() => setGuestPanelInv(inv)}
                                  className="text-ivory/40 hover:text-gold transition-colors"
                                  title="Ver invitados"
                                >
                                  <Users size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => copyLink(inv.shareToken)}
                                className={`transition-colors ${
                                  copied === inv.shareToken
                                    ? 'text-green-400'
                                    : 'text-ivory/40 hover:text-ivory'
                                }`}
                                title="Copiar enlace"
                              >
                                {copied === inv.shareToken ? <Check size={14} /> : <Copy size={14} />}
                              </button>

                              <a
                                href={`/invitacion/${inv.shareToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ivory/40 hover:text-gold transition-colors"
                                title="Ver invitación"
                              >
                                <ExternalLink size={14} />
                              </a>

                              <button
                                onClick={() => setConfirmArchive(inv)}
                                className="text-ivory/30 hover:text-red-400 transition-colors"
                                title="Archivar"
                              >
                                <Archive size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUnarchive(inv.id)}
                              className="text-ivory/30 hover:text-green-400 transition-colors"
                              title="Restaurar"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
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

      {showWizard && (
        <InvitationWizard
          onClose={closeWizard}
          onSave={handleSave}
          mode="admin"
          initialData={editTarget}
        />
      )}

      {guestPanelInv && (
        <GuestListPanel
          invitationId={guestPanelInv.id}
          invitationTitle={guestPanelInv.title}
          onClose={() => setGuestPanelInv(null)}
          mode="admin"
        />
      )}

      {/* Archive confirmation modal */}
      {confirmArchive && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-gold">
              <Archive size={24} />
              <h3 className="font-cormorant text-xl">Archivar Invitación</h3>
            </div>
            <p className="text-ivory/60 text-sm font-dm">
              La invitación <strong>{confirmArchive.title}</strong> se moverá a la sección de archivadas.
            </p>
            <div>
              <label className="block text-ivory/40 text-[10px] uppercase tracking-wider mb-1.5 ml-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Ej: Evento finalizado..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ivory text-sm focus:border-gold/50 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setConfirmArchive(null); setArchiveReason('') }}
                className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-ivory/60 hover:text-ivory text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
              >
                {isArchiving ? 'Archivando...' : 'Archivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
