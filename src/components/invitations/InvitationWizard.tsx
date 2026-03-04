import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import api from '../../api/client'
import { ApiInvitation, InvitationTemplate, resolveInvitationImageUrl } from './invitationTypes'

const TEMPLATES: Array<{ id: InvitationTemplate; label: string; desc: string; gradient: string; isDark: boolean }> = [
  {
    id: 'warm', label: 'Cálida', desc: 'Cremas suaves y dorado miel',
    gradient: 'linear-gradient(135deg, #fdf6ee 0%, #f0e0c8 50%, #e8d5b8 100%)', isDark: false,
  },
  {
    id: 'floral', label: 'Floral', desc: 'Rosa polvoso y romanticismo',
    gradient: 'linear-gradient(135deg, #fdf0f4 0%, #f4d8e8 50%, #ecc8dc 100%)', isDark: false,
  },
  {
    id: 'rustic', label: 'Rústica', desc: 'Tierra oscura, detalles dorados',
    gradient: 'linear-gradient(135deg, #1e1008 0%, #2d1a0a 50%, #1e1208 100%)', isDark: true,
  },
  {
    id: 'moderno', label: 'Moderno', desc: 'Navy elegante y líneas limpias',
    gradient: 'linear-gradient(135deg, #08101e 0%, #0f1a30 50%, #08101e 100%)', isDark: true,
  },
]

const STEPS = ['Plantilla', 'Datos', 'Contenido', 'Galería', 'Publicar']

interface InvitationDraft {
  title: string
  eventType: string
  eventDate: string
  template: InvitationTemplate
  isPublished: boolean
  ownerName?: string
  ownerEmail?: string
  clientId?: string
  data: {
    title: string
    names: string
    eventType: string
    date: string
    time: string
    venue: string
    locationNote: string
    message: string
    quote: string
    hashtag: string
    dressCode: string
    rsvpLabel: string
    rsvpValue: string
  }
}

interface Client { id: string; name: string; email: string }

const emptyDraft: InvitationDraft = {
  title: 'Invitación digital',
  eventType: 'Boda',
  eventDate: '',
  template: 'floral',
  isPublished: false,
  data: {
    title: 'Estás invitado a nuestra boda',
    names: '', eventType: 'Boda', date: '', time: '',
    venue: '', locationNote: '', message: '',
    quote: '', hashtag: '#NuestraHistoria',
    dressCode: '', rsvpLabel: 'Confirmar asistencia', rsvpValue: '',
  },
}

function draftFromApi(inv: ApiInvitation, ownerName?: string, ownerEmail?: string): InvitationDraft {
  return {
    title: inv.title,
    eventType: inv.eventType,
    eventDate: inv.eventDate,
    template: (inv.template as InvitationTemplate) || 'floral',
    isPublished: inv.isPublished,
    ownerName,
    ownerEmail,
    clientId: inv.clientId,
    data: {
      title: inv.title,
      names: inv.names,
      eventType: inv.eventType,
      date: inv.eventDate,
      time: inv.eventTime || '',
      venue: inv.venue || '',
      locationNote: inv.locationNote || '',
      message: inv.message || '',
      quote: inv.quote || '',
      hashtag: inv.hashtag || '',
      dressCode: inv.dressCode || '',
      rsvpLabel: inv.rsvpLabel || 'Confirmar asistencia',
      rsvpValue: inv.rsvpValue || '',
    },
  }
}

export default function InvitationWizard({
  onClose,
  onSave,
  ownerName,
  ownerEmail,
  mode = 'client',
  initialData,
}: {
  onClose: () => void
  onSave: (invitation: ApiInvitation) => void
  ownerName?: string
  ownerEmail?: string
  mode?: 'client' | 'admin'
  initialData?: ApiInvitation
}) {
  const isEdit = !!initialData
  const showOwnerFields = mode === 'client' && (!ownerName || !ownerEmail)

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<InvitationDraft>(
    initialData
      ? draftFromApi(initialData, ownerName, ownerEmail)
      : { ...emptyDraft, ownerName, ownerEmail }
  )
  const [photos, setPhotos] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Admin: client search
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState(
    initialData?.client
      ? `${initialData.client.name} – ${initialData.client.email}`
      : ''
  )
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (mode !== 'admin') return
    api.get<{ data: Client[] }>('/admin/clients', { limit: 100 })
      .then(r => setClients(r.data))
      .catch(() => {})
  }, [mode])

  const filteredClients = clients.filter(c =>
    !clientSearch ||
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  ).slice(0, 8)

  const setField = (field: keyof InvitationDraft) => (v: string | boolean | InvitationTemplate) =>
    setDraft(p => ({ ...p, [field]: v as never }))

  const setData = (field: keyof InvitationDraft['data']) => (v: string) =>
    setDraft(p => ({ ...p, data: { ...p.data, [field]: v } }))

  const setDataAndTop = (df: keyof InvitationDraft['data'], tf: keyof InvitationDraft) => (v: string) =>
    setDraft(p => ({ ...p, [tf]: v as never, data: { ...p.data, [df]: v } }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    try {
      if (mode === 'admin' && !draft.clientId) {
        setError('Selecciona un cliente para esta invitación')
        setIsSaving(false)
        return
      }
      if (!draft.data.names.trim()) {
        setError('El nombre del festejado es requerido')
        setIsSaving(false)
        return
      }

      const payload: Record<string, unknown> = {
        eventType: draft.data.eventType,
        title: draft.data.title,
        names: draft.data.names,
        eventDate: draft.data.date,
        eventTime: draft.data.time || undefined,
        venue: draft.data.venue || undefined,
        locationNote: draft.data.locationNote || undefined,
        message: draft.data.message || undefined,
        quote: draft.data.quote || undefined,
        hashtag: draft.data.hashtag || undefined,
        template: draft.template,
        dressCode: draft.data.dressCode || undefined,
        rsvpLabel: draft.data.rsvpLabel || undefined,
        rsvpValue: draft.data.rsvpValue || undefined,
        isPublished: draft.isPublished,
      }

      if (mode === 'admin') payload.clientId = draft.clientId

      const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
      const endpoint = isEdit ? `${base}/${initialData!.id}` : base

      const res = isEdit
        ? await api.put<{ data: ApiInvitation }>(endpoint, payload)
        : await api.post<{ data: ApiInvitation }>(endpoint, payload)

      let saved = res.data

      if (photos.length > 0) {
        const form = new FormData()
        photos.forEach(p => form.append('images', p))
        const up = await api.postForm<{ data: ApiInvitation }>(
          `${base}/${saved.id}/photos`,
          form
        )
        saved = up.data
      }

      onSave(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la invitación')
    } finally {
      setIsSaving(false)
    }
  }

  const ic = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/20 focus:border-gold/50 focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-3xl glass rounded-2xl border border-white/10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="label-caps text-gold text-xs">Invitación digital</p>
            <h3 className="font-cormorant text-xl text-ivory">
              {isEdit ? 'Editar invitación' : 'Crear en 5 pasos'}
            </h3>
          </div>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory transition-colors">✕</button>
        </div>

        {/* Step indicators */}
        <div className="px-6 py-4 border-b border-white/5 flex gap-2">
          {STEPS.map((label, idx) => (
            <button
              key={label}
              onClick={() => setStep(idx)}
              className={`flex-1 rounded-full text-[0.6rem] uppercase tracking-[0.2em] px-2 py-2 text-center transition-colors ${
                idx === step
                  ? 'bg-gold/20 text-gold'
                  : idx < step
                  ? 'bg-white/10 text-ivory/50 hover:bg-white/15'
                  : 'bg-white/5 text-ivory/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-1">

          {/* Step 0: Template */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setField('template')(tpl.id)}
                  className={`p-4 border rounded-xl text-left transition-all duration-200 ${
                    draft.template === tpl.id
                      ? 'border-gold bg-gold/10 scale-[1.02]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="h-24 rounded-lg mb-4 overflow-hidden" style={{ background: tpl.gradient }}>
                    <div className="h-full flex flex-col items-center justify-center gap-1">
                      <div className="h-px w-8" style={{ background: tpl.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                      <div className="w-1.5 h-1.5 rotate-45" style={{ background: tpl.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }} />
                      <div className="h-px w-8" style={{ background: tpl.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                  <h4 className="font-dm text-ivory text-sm font-medium">{tpl.label}</h4>
                  <p className="text-ivory/40 text-xs mt-0.5">{tpl.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Data */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Título</label>
                <input
                  value={draft.data.title}
                  onChange={e => setDataAndTop('title', 'title')(e.target.value)}
                  className={ic}
                  placeholder="Estás invitado a nuestra boda"
                />
              </div>
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Nombres del festejado</label>
                <input
                  value={draft.data.names}
                  onChange={e => setData('names')(e.target.value)}
                  className={ic}
                  placeholder="Ej. Ana & Carlos"
                />
              </div>
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Tipo de evento</label>
                <input
                  value={draft.data.eventType}
                  onChange={e => setDataAndTop('eventType', 'eventType')(e.target.value)}
                  className={ic}
                  placeholder="Boda, XV, Cumpleaños..."
                />
              </div>
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Fecha</label>
                <input
                  value={draft.data.date}
                  onChange={e => setDataAndTop('date', 'eventDate')(e.target.value)}
                  className={ic}
                  placeholder="12 junio 2026"
                />
              </div>
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Hora</label>
                <input
                  value={draft.data.time}
                  onChange={e => setData('time')(e.target.value)}
                  className={ic}
                  placeholder="18:00"
                />
              </div>
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Lugar / Venue</label>
                <input
                  value={draft.data.venue}
                  onChange={e => setData('venue')(e.target.value)}
                  className={ic}
                  placeholder="Hacienda San Miguel"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Nota de ubicación</label>
                <input
                  value={draft.data.locationNote}
                  onChange={e => setData('locationNote')(e.target.value)}
                  className={ic}
                  placeholder="Ciudad, País"
                />
              </div>

              {/* Admin: client picker */}
              {mode === 'admin' && (
                <div className="md:col-span-2 relative">
                  <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                    Cliente <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={e => {
                      setClientSearch(e.target.value)
                      setShowDropdown(true)
                      setDraft(p => ({ ...p, clientId: undefined }))
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Buscar cliente por nombre o email..."
                    className={`${ic} ${draft.clientId ? 'border-green-500/50' : ''}`}
                  />
                  {draft.clientId && (
                    <p className="text-green-400 text-xs mt-1 font-dm">✓ Cliente vinculado</p>
                  )}
                  {showDropdown && !draft.clientId && (
                    <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                      {clients.length === 0 ? (
                        <p className="px-4 py-3 text-ivory/40 text-xs font-dm">Cargando clientes...</p>
                      ) : filteredClients.length === 0 ? (
                        <p className="px-4 py-3 text-ivory/40 text-xs font-dm">Sin resultados</p>
                      ) : (
                        <div className="max-h-44 overflow-y-auto">
                          {filteredClients.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setDraft(p => ({ ...p, clientId: c.id }))
                                setClientSearch(`${c.name} – ${c.email}`)
                                setShowDropdown(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                              <p className="text-ivory text-sm font-dm">{c.name}</p>
                              <p className="text-ivory/40 text-xs">{c.email}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Client: optional owner fields */}
              {showOwnerFields && (
                <>
                  <div>
                    <label className="block text-ivory/60 text-xs font-dm mb-1.5">Tu nombre</label>
                    <input
                      value={draft.ownerName || ''}
                      onChange={e => setField('ownerName')(e.target.value)}
                      className={ic}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-ivory/60 text-xs font-dm mb-1.5">Tu email</label>
                    <input
                      type="email"
                      value={draft.ownerEmail || ''}
                      onChange={e => setField('ownerEmail')(e.target.value)}
                      className={ic}
                      placeholder="tu@email.com"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              {([
                { label: 'Mensaje personal', field: 'message', span: true },
                { label: 'Cita o frase especial', field: 'quote', span: true },
                { label: 'Código de vestimenta', field: 'dressCode', span: false },
                { label: 'Hashtag', field: 'hashtag', span: false },
              ] as const).map(({ label, field, span }) => (
                <div key={field} className={span ? 'md:col-span-2' : ''}>
                  <label className="block text-ivory/60 text-xs font-dm mb-1.5">{label}</label>
                  <textarea
                    rows={span ? 3 : 2}
                    value={draft.data[field as keyof typeof draft.data]}
                    onChange={e => setData(field)(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/20 focus:border-gold/50 focus:outline-none resize-none"
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Gallery */}
          {step === 3 && (
            <div className="space-y-5">
              {isEdit && (initialData?.gallery?.length ?? 0) > 0 && (
                <div>
                  <p className="text-ivory/60 text-xs font-dm mb-3">
                    Fotos actuales ({initialData!.gallery!.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {initialData!.gallery!.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden border border-white/10"
                      >
                        <img src={resolveInvitationImageUrl(url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                  {isEdit ? 'Agregar más fotos' : 'Subir fotos de galería'}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setPhotos(Array.from(e.target.files || []))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory/60 text-sm"
                />
                <p className="text-ivory/30 text-xs mt-2">
                  {photos.length > 0
                    ? `${photos.length} foto(s) seleccionada(s)`
                    : 'Hasta 8 fotos. Se muestran en la sección galería de la invitación.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Publish */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/60 text-xs font-dm mb-1.5">Etiqueta RSVP</label>
                  <input
                    value={draft.data.rsvpLabel}
                    onChange={e => setData('rsvpLabel')(e.target.value)}
                    className={ic}
                    placeholder="Confirmar asistencia"
                  />
                </div>
                <div>
                  <label className="block text-ivory/60 text-xs font-dm mb-1.5">Contacto RSVP</label>
                  <input
                    value={draft.data.rsvpValue}
                    onChange={e => setData('rsvpValue')(e.target.value)}
                    className={ic}
                    placeholder="+52 55 1234 5678 o https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                <div>
                  <p className="text-ivory text-sm font-dm">Publicar invitación</p>
                  <p className="text-ivory/40 text-xs">Activa el enlace único y el código QR</p>
                </div>
                <button
                  onClick={() => setField('isPublished')(!draft.isPublished)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    draft.isPublished ? 'bg-gold' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                      draft.isPublished ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5 flex items-start gap-3">
                <CheckCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
                <div className="text-ivory/60 text-xs font-dm leading-relaxed">
                  Se generará un enlace único y código QR al {isEdit ? 'actualizar' : 'guardar'}.
                  El enlace permanece activo mientras la invitación esté publicada.
                </div>
              </div>

              {isEdit && initialData?.shareToken && (
                <div className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <p className="text-ivory/40 text-xs font-dm mb-2">Enlace actual</p>
                  <a
                    href={`/invitacion/${initialData.shareToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold text-xs font-dm hover:text-gold-light flex items-center gap-1"
                  >
                    <Eye size={12} />
                    /invitacion/{initialData.shareToken}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center gap-4">
          <div className="flex-1">
            {error && (
              <p className="text-red-400 text-xs font-dm">{error}</p>
            )}
          </div>
          <button
            onClick={prev}
            disabled={step === 0}
            className="btn-outline px-4 py-2 text-xs disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary px-5 py-2 text-xs flex items-center gap-1">
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : isEdit ? 'Actualizar invitación' : 'Guardar invitación'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
