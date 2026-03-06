import { useEffect, useState } from 'react'
import { Mail, Eye, Trash2, Plus, Pencil, Copy, Check, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react'
import InvitationWizard from '../invitations/InvitationWizard'
import api from '../../api/client'
import { ApiInvitation } from '../invitations/invitationTypes'

export default function AdminInvitations() {
  const [invitations, setInvitations] = useState<ApiInvitation[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [editTarget, setEditTarget] = useState<ApiInvitation | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active')
  const [copied, setCopied] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { refresh() }, [viewMode])

  const refresh = async () => {
    setIsLoading(true)
    try {
      const base = viewMode === 'history' ? '/admin/history/invitations' : '/admin/invitations'
      const res = await api.get<{ data: ApiInvitation[] }>(base)
      setInvitations(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  const openCreate = () => {
    if (viewMode === 'history') return
    setEditTarget(undefined)
    setShowWizard(true)
  }
  const openEdit = (inv: ApiInvitation) => {
    if (viewMode === 'history') return
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
    if (viewMode === 'history') return
    try {
      await api.patch(`/admin/invitations/${inv.id}/toggle-published`)
      refresh()
    } catch { /* silent */ }
  }

  const deleteInvitation = async (id: string) => {
    if (viewMode === 'history') return
    try {
      await api.delete(`/admin/invitations/${id}`)
      setDeleteConfirm(null)
      refresh()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-ivory/50 text-sm font-dm">
          {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''}
          {viewMode === 'history' ? ' en historial' : ''}
        </p>
        <div className="flex items-center gap-2">
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
              onClick={() => setViewMode('history')}
              className={`px-2.5 py-1.5 rounded text-xs font-dm transition-colors ${
                viewMode === 'history' ? 'bg-gold/20 text-gold' : 'text-ivory/50 hover:text-ivory'
              }`}
            >
              Historial
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
            {viewMode === 'active' ? 'No hay invitaciones creadas' : 'No hay invitaciones en historial'}
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
            {invitations.map(inv => (
              <div key={inv.id} className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-ivory text-sm font-dm truncate">{inv.title}</p>
                    <p className="text-ivory/45 text-xs truncate">
                      {inv.client?.name || inv.client?.email || 'Sin cliente'}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePublished(inv)}
                    className={`flex items-center gap-1 text-xs font-dm px-2 py-1 rounded-full transition-colors ${
                      inv.isPublished
                        ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20'
                        : 'bg-gray-400/10 text-gray-400 hover:bg-gray-400/20'
                    }`}
                    title="Cambiar estado"
                  >
                    {inv.isPublished ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                    {inv.isPublished ? 'Publicada' : 'Borrador'}
                  </button>
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

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEdit(inv)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-ivory/70 border border-white/10 rounded-lg px-2 py-2 text-xs"
                    title="Editar invitaciÃ³n"
                  >
                    <Pencil size={13} /> Editar
                  </button>
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
                    title="Ver invitaciÃ³n"
                  >
                    <ExternalLink size={13} /> Ver
                  </a>
                </div>

                {deleteConfirm === inv.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteInvitation(inv.id)}
                      className="flex-1 text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs"
                    >
                      Confirmar eliminaciÃ³n
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-ivory/40 border border-white/10 rounded-lg px-3 py-2 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(inv.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 text-ivory/50 border border-white/10 rounded-lg px-3 py-2 text-xs hover:text-danger"
                    title="Eliminar"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['TÃ­tulo', 'Cliente', 'Evento', 'Fecha', 'Vistas', 'Estado', 'Acciones'].map(h => (
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
                  {invitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-4 py-3 text-ivory text-sm font-dm max-w-[160px] truncate">
                        {inv.title}
                      </td>
                      <td className="px-4 py-3 text-ivory/60 text-sm font-dm">
                        {inv.client?.name || inv.client?.email || (
                          <span className="text-ivory/30 italic">Sin cliente</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ivory/60 text-sm font-dm">{inv.eventType}</td>
                      <td className="px-4 py-3 text-ivory/50 text-xs font-dm">{inv.eventDate}</td>
                      <td className="px-4 py-3 text-ivory/50 text-xs font-dm">
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {inv.views}
                        </span>
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(inv)}
                            className="text-ivory/40 hover:text-gold transition-colors"
                            title="Editar invitaciÃ³n"
                          >
                            <Pencil size={14} />
                          </button>

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
                            title="Ver invitaciÃ³n"
                          >
                            <ExternalLink size={14} />
                          </a>

                          {deleteConfirm === inv.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteInvitation(inv.id)}
                                className="text-red-400 text-xs font-dm hover:text-red-300"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-ivory/30 text-xs font-dm hover:text-ivory"
                              >
                                x
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(inv.id)}
                              className="text-ivory/30 hover:text-danger transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
    </div>
  )
}


