import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Copy, Check, Trash2, Plus, RefreshCw } from 'lucide-react'
import api from '../../api/client'
import { ApiInvitation, ApiInvitationGuest, InvitationTemplate, resolveInvitationImageUrl } from './invitationTypes'
import ImageCropModal from './ImageCropModal'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const isAllowedImage = (file: File) => {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true
  const name = file.name.toLowerCase()
  const dot = name.lastIndexOf('.')
  if (dot === -1) return false
  return ALLOWED_IMAGE_EXTS.has(name.slice(dot))
}

type CustomPageEntry = { kind: 'saved'; url: string } | { kind: 'new'; file: File }

const TEMPLATES: Array<{ id: InvitationTemplate; label: string; desc: string; gradient: string; isDark: boolean }> = [
  {
    id: 'warm', label: 'Calida', desc: 'Cremas suaves y dorado miel',
    gradient: 'linear-gradient(135deg, #fdf6ee 0%, #f0e0c8 50%, #e8d5b8 100%)', isDark: false,
  },
  {
    id: 'floral', label: 'Floral', desc: 'Rosa polvoso y romanticismo',
    gradient: 'linear-gradient(135deg, #fdf0f4 0%, #f4d8e8 50%, #ecc8dc 100%)', isDark: false,
  },
  {
    id: 'rustic', label: 'Rustica', desc: 'Tierra oscura, detalles dorados',
    gradient: 'linear-gradient(135deg, #1e1008 0%, #2d1a0a 50%, #1e1208 100%)', isDark: true,
  },
  {
    id: 'moderno', label: 'Moderno', desc: 'Navy elegante y lineas limpias',
    gradient: 'linear-gradient(135deg, #08101e 0%, #0f1a30 50%, #08101e 100%)', isDark: true,
  },
  {
    id: 'vintage', label: 'Vintage', desc: 'Papel envejecido, sepia elegante',
    gradient: 'linear-gradient(135deg, #f3e8d5 0%, #e8d5bc 50%, #dcc4a4 100%)', isDark: false,
  },
  {
    id: 'pearl', label: 'Perla', desc: 'Plata suave, lujo contemporaneo',
    gradient: 'linear-gradient(135deg, #fafafa 0%, #f2f2f8 50%, #e8e8f2 100%)', isDark: false,
  },
  {
    id: 'esmeralda', label: 'Esmeralda', desc: 'Verde profundo, botanico',
    gradient: 'linear-gradient(135deg, #071a12 0%, #0c2618 50%, #071510 100%)', isDark: true,
  },
  {
    id: 'noir', label: 'Noir', desc: 'Negro y blanco editorial',
    gradient: 'linear-gradient(135deg, #080808 0%, #111111 50%, #080808 100%)', isDark: true,
  },
  {
    id: 'lavanda', label: 'Lavanda', desc: 'Violeta romantico y mistico',
    gradient: 'linear-gradient(135deg, #f5f0ff 0%, #ece2fb 50%, #e0d0f5 100%)', isDark: false,
  },
  {
    id: 'terracota', label: 'Terracota', desc: 'Tierra calida, estilo boho',
    gradient: 'linear-gradient(135deg, #f5ede2 0%, #ecdbc8 50%, #e0c8b0 100%)', isDark: false,
  },
  {
    id: 'custom', label: 'Personalizada', desc: 'Sube tu propio fondo PNG',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)', isDark: true,
  },
]

const STEPS_GENERAL    = ['Tipo', 'Plantilla', 'Datos', 'Contenido', 'Galeria', 'Publicar']
const STEPS_INDIVIDUAL = ['Tipo', 'Plantilla', 'Invitados', 'Datos', 'Contenido', 'Galeria', 'Publicar']

type ReliefEffect = 'none' | 'emboss' | 'foil'
type InvitationType = 'general' | 'individual'

interface InvitationDraft {
  invitationType: InvitationType
  title: string
  eventType: string
  eventDate: string
  template: InvitationTemplate
  reliefEffect: ReliefEffect
  isPublished: boolean
  enableTableNumber: boolean
  rsvpDeadline: string
  guestGreeting: string
  defaultGuestName: string
  heroImage: string
  ownerName?: string
  ownerEmail?: string
  clientId?: string
  ceremonyVenue: string
  ceremonyAddress: string
  ceremonyTime: string
  ceremonyPhoto: string
  ceremonyMapUrl: string
  receptionVenue: string
  receptionAddress: string
  receptionTime: string
  receptionPhoto: string
  receptionMapUrl: string
  parentsInfo: string
  sponsorsInfo: string
  giftsInfo: string
  instagramHandle: string
  backgroundMusic: string        // URL existente (cuando se edita)
  customTemplate: string         // URL plantilla personalizada (cuando se edita)
  customTemplatePages: string[]  // URLs de páginas de plantilla (cuando se edita)
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
interface PendingGuest { id: string; name: string }

const emptyDraft: InvitationDraft = {
  invitationType: 'general',
  title: 'Invitacion digital',
  eventType: 'Boda',
  eventDate: '',
  template: 'floral',
  reliefEffect: 'none',
  isPublished: true,
  enableTableNumber: false,
  rsvpDeadline: '',
  guestGreeting: 'Hola',
  defaultGuestName: 'Familia y Amigos',
  heroImage: '',
  ceremonyVenue: '',
  ceremonyAddress: '',
  ceremonyTime: '',
  ceremonyPhoto: '',
  ceremonyMapUrl: '',
  receptionVenue: '',
  receptionAddress: '',
  receptionTime: '',
  receptionPhoto: '',
  receptionMapUrl: '',
  parentsInfo: '',
  sponsorsInfo: '',
  giftsInfo: '',
  instagramHandle: '',
  backgroundMusic: '',
  customTemplate: '',
  customTemplatePages: [],
  data: {
    title: 'Estas invitado a nuestra boda',
    names: '', eventType: 'Boda', date: '', time: '',
    venue: '', locationNote: '', message: '',
    quote: '', hashtag: '#NuestraHistoria',
    dressCode: '', rsvpLabel: 'Confirmar asistencia', rsvpValue: '',
  },
}

function draftFromApi(inv: ApiInvitation, ownerName?: string, ownerEmail?: string): InvitationDraft {
  const rawTemplate = String(inv.template || 'floral')
  const reliefEffect: ReliefEffect = rawTemplate.endsWith('-emboss') ? 'emboss'
    : rawTemplate.endsWith('-foil') ? 'foil' : 'none'
  const baseTemplate = rawTemplate.replace(/-emboss$|-foil$/, '') as InvitationTemplate
  return {
    invitationType: ((inv as any).invitationType as InvitationType) || 'general',
    title: inv.title,
    eventType: inv.eventType,
    eventDate: inv.eventDate,
    template: baseTemplate,
    reliefEffect,
    isPublished: inv.isPublished,
    enableTableNumber: inv.enableTableNumber || false,
    rsvpDeadline: inv.rsvpDeadline ? inv.rsvpDeadline.slice(0, 16) : '',
    guestGreeting: inv.guestGreeting || 'Hola',
    defaultGuestName: inv.defaultGuestName || 'Familia y Amigos',
    heroImage: inv.heroImage || '',
    ownerName,
    ownerEmail,
    clientId: inv.clientId,
    ceremonyVenue: inv.ceremonyVenue || '',
    ceremonyAddress: inv.ceremonyAddress || '',
    ceremonyTime: inv.ceremonyTime || '',
    ceremonyPhoto: inv.ceremonyPhoto || '',
    ceremonyMapUrl: inv.ceremonyMapUrl || '',
    receptionVenue: inv.receptionVenue || '',
    receptionAddress: inv.receptionAddress || '',
    receptionTime: inv.receptionTime || '',
    receptionPhoto: inv.receptionPhoto || '',
    receptionMapUrl: inv.receptionMapUrl || '',
    parentsInfo: inv.parentsInfo || '',
    sponsorsInfo: inv.sponsorsInfo || '',
    giftsInfo: inv.giftsInfo || '',
    instagramHandle: inv.instagramHandle || '',
    backgroundMusic: inv.backgroundMusic || '',
    customTemplate: inv.customTemplate || '',
    customTemplatePages: Array.isArray(inv.customTemplatePages) && inv.customTemplatePages.length > 0
      ? inv.customTemplatePages
      : inv.customTemplate ? [inv.customTemplate] : [],
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
  const [photoWarnings, setPhotoWarnings] = useState<string[]>([])
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Estado dinámico de galería (se actualiza tras cada guardado)
  const [savedGallery, setSavedGallery] = useState<string[]>(() => initialData?.gallery || [])

  // Archivos para fotos individuales (hero, ceremonia, recepción)
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [ceremonyPhotoFile, setCeremonyPhotoFile] = useState<File | null>(null)
  const [receptionPhotoFile, setReceptionPhotoFile] = useState<File | null>(null)

  // Plantilla personalizada multi-página — array unificado (saved URL | new File)
  const [customPages, setCustomPages] = useState<CustomPageEntry[]>(() => {
    const pages = Array.isArray(initialData?.customTemplatePages) && initialData.customTemplatePages.length > 0
      ? initialData.customTemplatePages
      : initialData?.customTemplate ? [initialData.customTemplate] : []
    return pages.map(url => ({ kind: 'saved' as const, url }))
  })
  const [cropTarget,       setCropTarget]       = useState<File | null>(null)
  const [replaceIndex,     setReplaceIndex]     = useState<number | null>(null)
  const [pagePreviewUrls,  setPagePreviewUrls]  = useState<Map<number, string>>(new Map())

  const [guests, setGuests] = useState<ApiInvitationGuest[]>([])
  const [pendingGuests, setPendingGuests] = useState<PendingGuest[]>([])
  const [guestInput, setGuestInput] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [familySize, setFamilySize] = useState('2')
  const [isAddingGuest, setIsAddingGuest] = useState(false)
  const [guestCopied, setGuestCopied] = useState<string | null>(null)
  const [savedInvitationId, setSavedInvitationId] = useState<string | null>(initialData?.id ?? null)

  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState(
    initialData?.client ? `${initialData.client.name} - ${initialData.client.email}` : ''
  )
  const [showDropdown, setShowDropdown] = useState(false)

  const activeSteps = draft.invitationType === 'general' ? STEPS_GENERAL : STEPS_INDIVIDUAL
  const typeStep     = activeSteps.indexOf('Tipo')
  const templateStep = activeSteps.indexOf('Plantilla')
  const guestStep    = activeSteps.indexOf('Invitados')      // -1 for general
  const dataStep     = activeSteps.indexOf('Datos')
  const contentStep  = activeSteps.indexOf('Contenido')
  const galleryStep  = activeSteps.indexOf('Galeria')
  const publishStep  = activeSteps.length - 1
  const ic = 'inv-wizard-field w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none'

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

  const next = () => setStep(s => Math.min(s + 1, activeSteps.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  // Manage preview URLs for 'new' custom pages — revoke on change/unmount
  useEffect(() => {
    const urlMap = new Map<number, string>()
    customPages.forEach((page, i) => {
      if (page.kind === 'new') urlMap.set(i, URL.createObjectURL(page.file))
    })
    setPagePreviewUrls(urlMap)
    return () => urlMap.forEach(url => URL.revokeObjectURL(url))
  }, [customPages])

  useEffect(() => {
    if (guestStep < 0 || step !== guestStep || !savedInvitationId) return
    const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
    api.get<{ data: ApiInvitationGuest[] }>(`${base}/${savedInvitationId}/guests`)
      .then(r => setGuests(r.data))
      .catch(() => {})
  }, [step, guestStep, savedInvitationId, mode])

  const addPendingGuest = (name: string) => {
    const clean = name.trim()
    if (!clean) return
    setPendingGuests(prev => [...prev, { id: crypto.randomUUID(), name: clean }])
  }

  async function handleAddGuest() {
    if (!guestInput.trim()) return
    setIsAddingGuest(true)
    try {
      if (savedInvitationId) {
        const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
        await api.post(`${base}/${savedInvitationId}/guests`, { names: [guestInput.trim()] })
        const r = await api.get<{ data: ApiInvitationGuest[] }>(`${base}/${savedInvitationId}/guests`)
        setGuests(r.data)
      } else {
        addPendingGuest(guestInput)
      }
      setGuestInput('')
    } catch {
      // silent
    } finally {
      setIsAddingGuest(false)
    }
  }

  async function handleAddFamily() {
    const cleanFamilyName = familyName.trim()
    const size = Number(familySize)
    if (!cleanFamilyName || !Number.isFinite(size) || size < 1) return
    const familyLabel = `Familia ${cleanFamilyName} (${size} integrantes)`

    setIsAddingGuest(true)
    try {
      if (savedInvitationId) {
        const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
        await api.post(`${base}/${savedInvitationId}/guests`, { names: [familyLabel] })
        const r = await api.get<{ data: ApiInvitationGuest[] }>(`${base}/${savedInvitationId}/guests`)
        setGuests(r.data)
      } else {
        addPendingGuest(familyLabel)
      }
      setFamilyName('')
      setFamilySize('2')
    } catch {
      // silent
    } finally {
      setIsAddingGuest(false)
    }
  }

  async function handleDeleteGuest(guestId: string, isPending = false) {
    if (isPending) {
      setPendingGuests(prev => prev.filter(g => g.id !== guestId))
      return
    }
    if (!savedInvitationId) return

    try {
      const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
      await api.delete(`${base}/${savedInvitationId}/guests/${guestId}`)
      setGuests(prev => prev.filter(g => g.id !== guestId))
    } catch {
      // silent
    }
  }

  async function handleDeletePhoto(index: number) {
    if (!savedInvitationId) {
      setSavedGallery(prev => prev.filter((_, i) => i !== index))
      return
    }
    try {
      const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
      const res = await api.delete<{ data: ApiInvitation }>(`${base}/${savedInvitationId}/photos/${index}`)
      setSavedGallery(res.data.gallery || [])
    } catch {
      // silent
    }
  }

  function copyGuestLink(token: string) {
    const url = `${window.location.origin}/g/${token}`
    navigator.clipboard.writeText(url).catch(() => {})
    setGuestCopied(token)
    setTimeout(() => setGuestCopied(null), 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      if (mode === 'admin' && !draft.clientId) {
        setError('Selecciona un cliente para esta invitacion')
        setIsSaving(false)
        return
      }
      if (!draft.data.names.trim()) {
        setError('El nombre del festejado es requerido')
        setIsSaving(false)
        return
      }

      const effectSuffix = draft.reliefEffect && draft.reliefEffect !== 'none' ? `-${draft.reliefEffect}` : ''
      const payload: Record<string, unknown> = {
        invitationType: draft.invitationType,
        eventType: draft.data.eventType,
        title: draft.data.title,
        names: draft.data.names,
        eventDate: draft.data.date,
        eventTime: draft.data.time || null,
        venue: draft.data.venue || null,
        locationNote: draft.data.locationNote || null,
        message: draft.data.message || null,
        quote: draft.data.quote || null,
        hashtag: draft.data.hashtag || null,
        template: `${draft.template}${effectSuffix}`,
        dressCode: draft.data.dressCode || null,
        rsvpLabel: draft.data.rsvpLabel || null,
        rsvpValue: draft.data.rsvpValue || null,
        rsvpDeadline: draft.rsvpDeadline ? new Date(draft.rsvpDeadline).toISOString() : null,
        isPublished: draft.isPublished,
        enableTableNumber: draft.enableTableNumber,
        guestGreeting: draft.guestGreeting,
        defaultGuestName: draft.defaultGuestName,
        heroImage: draft.heroImage || null,
        ceremonyVenue: draft.ceremonyVenue || null,
        ceremonyAddress: draft.ceremonyAddress || null,
        ceremonyTime: draft.ceremonyTime || null,
        ceremonyPhoto: draft.ceremonyPhoto || null,
        ceremonyMapUrl: draft.ceremonyMapUrl || null,
        receptionVenue: draft.receptionVenue || null,
        receptionAddress: draft.receptionAddress || null,
        receptionTime: draft.receptionTime || null,
        receptionPhoto: draft.receptionPhoto || null,
        receptionMapUrl: draft.receptionMapUrl || null,
        parentsInfo: draft.parentsInfo || null,
        sponsorsInfo: draft.sponsorsInfo || null,
        giftsInfo: draft.giftsInfo || null,
        instagramHandle: draft.instagramHandle || null,
      }

      if (mode === 'admin') payload.clientId = draft.clientId

      const base = mode === 'admin' ? '/admin/invitations' : '/client/invitations'
      const endpoint = isEdit ? `${base}/${initialData!.id}` : base

      const res = isEdit
        ? await api.put<{ data: ApiInvitation }>(endpoint, payload)
        : await api.post<{ data: ApiInvitation }>(endpoint, payload)

      let saved = res.data
      setSavedInvitationId(saved.id)

      // Subir fotos individuales (hero, ceremonia, recepción)
      const singlePhotoUpdates: Record<string, string> = {}
      const singleFiles: Array<{ file: File; field: string }> = []
      if (heroImageFile) singleFiles.push({ file: heroImageFile, field: 'heroImage' })
      if (ceremonyPhotoFile) singleFiles.push({ file: ceremonyPhotoFile, field: 'ceremonyPhoto' })
      if (receptionPhotoFile) singleFiles.push({ file: receptionPhotoFile, field: 'receptionPhoto' })

      for (const { file, field } of singleFiles) {
        const form = new FormData()
        form.append('images', file)
        const up = await api.postForm<{ data: ApiInvitation }>(`${base}/${saved.id}/photos`, form)
        const gallery = up.data.gallery || []
        setSavedGallery(gallery)
        singlePhotoUpdates[field] = gallery[gallery.length - 1] || ''
      }

      // Si hay fotos individuales, hacer un segundo PUT para guardar las URLs en los campos correctos
      if (Object.keys(singlePhotoUpdates).length > 0) {
        const urlPayload = { ...payload, ...singlePhotoUpdates }
        const urlRes = await api.put<{ data: ApiInvitation }>(`${base}/${saved.id}`, urlPayload)
        saved = urlRes.data
        setDraft(p => ({ ...p, ...singlePhotoUpdates }))
        setHeroImageFile(null)
        setCeremonyPhotoFile(null)
        setReceptionPhotoFile(null)
      }

      if (photos.length > 0) {
        const form = new FormData()
        photos.forEach(p => form.append('images', p))
        const up = await api.postForm<{ data: ApiInvitation }>(`${base}/${saved.id}/photos`, form)
        saved = up.data
        setSavedGallery(saved.gallery || [])
        setPhotos([])
      }

      if (musicFile) {
        const form = new FormData()
        form.append('audio', musicFile)
        const up = await api.postForm<{ data: ApiInvitation }>(`${base}/${saved.id}/music`, form)
        saved = up.data
        setMusicFile(null)
      }

      if (draft.template === 'custom' && customPages.length > 0) {
        const form = new FormData()
        // Build ordered keepPages: saved URLs stay, new files become '__new__' placeholders
        const pageOrder: string[] = []
        const newFiles: File[] = []
        for (const page of customPages) {
          if (page.kind === 'saved') {
            pageOrder.push(page.url)
          } else {
            pageOrder.push('__new__')
            newFiles.push(page.file)
          }
        }
        form.append('keepPages', JSON.stringify(pageOrder))
        newFiles.forEach(f => form.append('pages', f))
        const up = await api.postForm<{ data: ApiInvitation }>(`${base}/${saved.id}/custom-template-pages`, form)
        saved = up.data
        const finalPages = Array.isArray(up.data.customTemplatePages) ? up.data.customTemplatePages : []
        setCustomPages(finalPages.map(url => ({ kind: 'saved' as const, url })))
        setDraft(p => ({
          ...p,
          customTemplate: saved.customTemplate || '',
          customTemplatePages: finalPages,
          template: 'custom',
        }))
      }

      // Actualizar galería desde el resultado final
      setSavedGallery(saved.gallery || [])

      if (!savedInvitationId && pendingGuests.length > 0) {
        await api.post(`${base}/${saved.id}/guests`, { names: pendingGuests.map(g => g.name) })
        setPendingGuests([])
      }

      onSave(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la invitacion')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        className="inv-wizard-modal w-full max-w-3xl glass rounded-2xl border border-white/10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="label-caps text-gold text-xs">Invitacion digital</p>
            <h3 className="font-cormorant text-xl text-ivory">
              {isEdit ? 'Editar invitacion' : `Crear ${draft.invitationType === 'general' ? 'invitación general' : 'invitación individual'}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-4 border-b border-white/5 flex gap-2">
          {activeSteps.map((label, idx) => (
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

        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-1">
          {step === typeStep && (
            <div className="space-y-5">
              <div>
                <p className="label-caps text-ivory/40 text-[0.6rem] mb-1">Tipo de invitación</p>
                <p className="text-ivory/30 text-xs font-dm mb-5">Elige cómo se distribuirá esta invitación</p>
                <div className="grid grid-cols-1 gap-4">
                  {([
                    {
                      id: 'general' as InvitationType,
                      label: 'Invitación General',
                      desc: 'Un enlace único compartido con todos los invitados. Ideal para WhatsApp o redes sociales.',
                      icon: '✉',
                      detail: 'Sin RSVP individual · Enlace único público',
                    },
                    {
                      id: 'individual' as InvitationType,
                      label: 'Individual Personalizada',
                      desc: 'Cada invitado recibe su propio enlace con su nombre y puede confirmar asistencia (RSVP).',
                      icon: '✦',
                      detail: 'RSVP por invitado · Nombre personalizado · Seguimiento',
                    },
                  ]).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (draft.invitationType !== opt.id) {
                          setDraft(p => ({ ...p, invitationType: opt.id }))
                          setStep(0) // reset to Tipo step so user can review
                        }
                      }}
                      className={`p-5 border rounded-xl text-left transition-all duration-200 flex gap-4 items-start ${
                        draft.invitationType === opt.id
                          ? 'border-gold bg-gold/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl mt-0.5 flex-shrink-0" style={{ color: draft.invitationType === opt.id ? '#C9A96E' : 'rgba(255,255,255,0.3)' }}>{opt.icon}</span>
                      <div>
                        <h4 className="font-dm text-ivory text-sm font-medium mb-1">{opt.label}</h4>
                        <p className="text-ivory/50 text-xs font-dm leading-relaxed mb-2">{opt.desc}</p>
                        <p className="text-ivory/30 text-[0.6rem] font-dm uppercase tracking-wider">{opt.detail}</p>
                      </div>
                      {draft.invitationType === opt.id && (
                        <CheckCircle size={18} className="text-gold flex-shrink-0 ml-auto mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === templateStep && (
            <div className="space-y-6">
              <div>
                <p className="label-caps text-ivory/40 text-[0.6rem] mb-3">Elige una plantilla</p>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => setField('template')(tpl.id)}
                      className={`p-3 border rounded-xl text-left transition-all duration-200 ${
                        draft.template === tpl.id ? 'border-gold bg-gold/10 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="h-16 rounded-lg mb-3 overflow-hidden" style={{ background: tpl.gradient }}>
                        <div className="h-full flex flex-col items-center justify-center gap-1">
                          <div className="h-px w-6" style={{ background: tpl.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                          <div className="w-1 h-1 rotate-45" style={{ background: tpl.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }} />
                          <div className="h-px w-6" style={{ background: tpl.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                        </div>
                      </div>
                      <h4 className="font-dm text-ivory text-xs font-medium">{tpl.label}</h4>
                      <p className="text-ivory/40 text-[0.6rem] mt-0.5">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plantilla personalizada — páginas */}
              {draft.template === 'custom' && (
                <div className="space-y-3">
                  <div>
                    <p className="label-caps text-ivory/40 text-[0.6rem] mb-1">Páginas de la plantilla</p>
                    <p className="text-ivory/30 text-xs font-dm">
                      Sube 1–4 imágenes (una por sección del scroll). Se recortarán automáticamente a formato 9:16.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {customPages.map((page, i) => {
                      const imgSrc = page.kind === 'saved'
                        ? resolveInvitationImageUrl(page.url)
                        : pagePreviewUrls.get(i) ?? ''
                      const isPending = page.kind === 'new'
                      return (
                        <div
                          key={i}
                          className={`relative rounded-xl overflow-hidden border flex flex-col ${isPending ? 'border-gold/40' : 'border-white/15'}`}
                          style={{ aspectRatio: '9/16' }}
                        >
                          <img src={imgSrc} className="absolute inset-0 w-full h-full object-cover" alt={`Hoja ${i + 1}`} />
                          {/* Bottom bar — always visible, label + action buttons */}
                          <div className="relative z-10 mt-auto flex items-end justify-between px-2 pb-2 pt-6 bg-gradient-to-t from-black/75 to-transparent">
                            <p className={`text-[0.6rem] font-dm leading-none ${isPending ? 'text-gold' : 'text-ivory/60'}`}>
                              Hoja {i + 1}{isPending ? <><br /><span className="opacity-70">pendiente</span></> : ''}
                            </p>
                            <div className="flex items-center gap-1">
                              {/* Replace */}
                              <label
                                className="bg-black/60 text-ivory/50 hover:text-gold rounded-full p-1.5 cursor-pointer transition-colors"
                                title="Reemplazar hoja"
                              >
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                                  className="hidden"
                                  onChange={e => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; setReplaceIndex(i); setCropTarget(f) } }}
                                />
                                <RefreshCw size={10} />
                              </label>
                              {/* Delete */}
                              <button
                                onClick={() => setCustomPages(prev => prev.filter((_, j) => j !== i))}
                                className="bg-black/60 text-red-400/80 hover:text-red-400 rounded-full p-1.5 transition-colors"
                                title="Eliminar hoja"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {/* Add button */}
                    {customPages.length < 4 && (
                      <label
                        className="rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 transition-colors gap-2"
                        style={{ aspectRatio: '9/16' }}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; setReplaceIndex(null); setCropTarget(f) } }}
                        />
                        <Plus size={22} className="text-ivory/25" />
                        <p className="text-ivory/25 text-[0.6rem] font-dm text-center px-3">
                          {customPages.length === 0 ? 'Agregar hoja 1' : `Agregar hoja ${customPages.length + 1}`}
                        </p>
                      </label>
                    )}
                  </div>
                  <p className="text-ivory/25 text-[0.62rem] font-dm">
                    Hoja 1 = héroe · Hoja 2 = eventos · Hoja 3 = galería · Hoja 4 = cierre
                  </p>
                </div>
              )}

              {/* Relief effect */}
              <div>
                <p className="label-caps text-ivory/40 text-[0.6rem] mb-3">Efecto de Relieve</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'none'   as ReliefEffect, label: 'Ninguno',  desc: 'Sin efecto adicional' },
                    { id: 'emboss' as ReliefEffect, label: 'Relieve',  desc: 'Texto en alto relieve' },
                    { id: 'foil'   as ReliefEffect, label: 'Lamina',   desc: 'Brillo metalico dorado' },
                  ]).map(ef => (
                    <button
                      key={ef.id}
                      onClick={() => setDraft(p => ({ ...p, reliefEffect: ef.id }))}
                      className={`p-3 border rounded-xl text-left transition-all duration-200 ${
                        draft.reliefEffect === ef.id ? 'border-gold bg-gold/10 scale-[1.01]' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-8 rounded mb-2 flex items-center justify-center overflow-hidden"
                        style={{
                          background: ef.id === 'foil'
                            ? 'linear-gradient(135deg, #c9a96e 0%, #f5e0a0 35%, #c9a96e 55%, #e8d070 80%, #c9a96e 100%)'
                            : ef.id === 'emboss'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(255,255,255,0.03)',
                          boxShadow: ef.id === 'emboss'
                            ? '2px 2px 5px rgba(0,0,0,0.4), -1px -1px 3px rgba(255,255,255,0.08)'
                            : 'none',
                        }}
                      >
                        <span className="text-[0.55rem] uppercase tracking-[0.2em]"
                          style={{
                            color: ef.id === 'foil' ? '#1a1008' : ef.id === 'emboss' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
                            textShadow: ef.id === 'emboss' ? '1px 1px 2px rgba(0,0,0,0.5), -0.5px -0.5px 1px rgba(255,255,255,0.1)' : 'none',
                          }}
                        >Aa</span>
                      </div>
                      <h4 className="font-dm text-ivory text-xs font-medium">{ef.label}</h4>
                      <p className="text-ivory/40 text-[0.6rem] mt-0.5">{ef.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === guestStep && (
            <div className="space-y-4">
              {draft.invitationType === 'general' ? (
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-4 flex gap-3">
                  <span className="text-amber-400 text-lg flex-shrink-0">ℹ</span>
                  <div>
                    <p className="text-amber-300 text-xs font-dm font-medium mb-1">Invitación General seleccionada</p>
                    <p className="text-ivory/50 text-xs font-dm leading-relaxed">
                      La invitación general usa un enlace único sin personalización por invitado. Si quieres RSVP individual, cambia el tipo a <strong className="text-ivory/70">Individual Personalizada</strong> en el paso 1.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-ivory/60 text-xs font-dm">Agrega invitados individuales o una familia completa.</p>
              )}

              <div className="flex gap-2">
                <input
                  value={guestInput}
                  onChange={e => setGuestInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddGuest() } }}
                  className={`${ic} flex-1`}
                  placeholder="Nombre del invitado"
                />
                <button
                  onClick={handleAddGuest}
                  disabled={isAddingGuest || !guestInput.trim()}
                  className="btn-primary px-3 py-2 text-xs disabled:opacity-40 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>

              <div className="grid md:grid-cols-[1fr_120px_auto] gap-2">
                <input
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  className={ic}
                  placeholder="Apellido o nombre de familia"
                />
                <input
                  type="number"
                  min={1}
                  value={familySize}
                  onChange={e => setFamilySize(e.target.value)}
                  className={ic}
                  placeholder="Integrantes"
                />
                <button
                  onClick={handleAddFamily}
                  disabled={isAddingGuest || !familyName.trim() || Number(familySize) < 1}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-40"
                >
                  Agregar familia
                </button>
              </div>

              {savedInvitationId ? (
                <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1">
                  {guests.map(g => (
                    <div key={g.id} className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/3">
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory text-sm font-dm truncate">{g.name}</p>
                        <span className={`text-xs font-dm ${
                          g.response === 'ACCEPTED' ? 'text-green-400' : g.response === 'DECLINED' ? 'text-red-400' : 'text-ivory/40'
                        }`}>
                          {g.response === 'ACCEPTED' ? 'Confirmado' : g.response === 'DECLINED' ? 'Declino' : 'Pendiente'}
                        </span>
                      </div>
                      <button
                        onClick={() => copyGuestLink(g.token)}
                        className={`flex items-center gap-1 text-xs font-dm px-2 py-1 rounded transition-colors ${
                          guestCopied === g.token ? 'text-green-400' : 'text-ivory/50 hover:text-ivory'
                        }`}
                        title="Copiar link"
                      >
                        {guestCopied === g.token ? <Check size={11} /> : <Copy size={11} />}
                        Link
                      </button>
                      <button onClick={() => handleDeleteGuest(g.id)} className="text-ivory/25 hover:text-danger transition-colors p-1" title="Eliminar invitado">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {guests.length === 0 && <p className="text-ivory/40 text-sm font-dm">Sin invitados aun</p>}
                </div>
              ) : (
                <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1">
                  {pendingGuests.map(g => (
                    <div key={g.id} className="flex items-center gap-2 p-3 border border-white/10 rounded-lg bg-white/3">
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory text-sm font-dm truncate">{g.name}</p>
                        <span className="text-xs font-dm text-ivory/40">Pendiente por guardar</span>
                      </div>
                      <button onClick={() => handleDeleteGuest(g.id, true)} className="text-ivory/25 hover:text-danger transition-colors p-1" title="Eliminar invitado">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {pendingGuests.length === 0 && <p className="text-ivory/40 text-sm font-dm">Sin invitados aun</p>}
                </div>
              )}
            </div>
          )}

          {step === dataStep && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Titulo</label>
                <input value={draft.data.title} onChange={e => setDataAndTop('title', 'title')(e.target.value)} className={ic} placeholder="Estas invitado a nuestra boda" />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Nombres del festejado</label>
                <input value={draft.data.names} onChange={e => setData('names')(e.target.value)} className={ic} placeholder="Ej. Ana & Carlos" />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Tipo de evento</label>
                <input value={draft.data.eventType} onChange={e => setDataAndTop('eventType', 'eventType')(e.target.value)} className={ic} placeholder="Boda, XV, Cumpleanos..." />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Fecha</label>
                <input value={draft.data.date} onChange={e => setDataAndTop('date', 'eventDate')(e.target.value)} className={ic} placeholder="12 junio 2026" />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Hora</label>
                <input value={draft.data.time} onChange={e => setData('time')(e.target.value)} className={ic} placeholder="18:00" />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Lugar / Venue</label>
                <input value={draft.data.venue} onChange={e => setData('venue')(e.target.value)} className={ic} placeholder="Hacienda San Miguel" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Nota de ubicacion</label>
                <input value={draft.data.locationNote} onChange={e => setData('locationNote')(e.target.value)} className={ic} placeholder="Ciudad, Pais" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Foto principal</label>
                <div className="flex gap-2">
                  <input value={draft.heroImage} onChange={e => setField('heroImage')(e.target.value)} className={`${ic} flex-1`} placeholder="https://... o /uploads/archivo.jpg" />
                  <label className="btn-outline px-3 py-2 text-xs cursor-pointer flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                    <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && isAllowedImage(f)) setHeroImageFile(f) }} />
                    {heroImageFile ? '✓ ' + heroImageFile.name.slice(0, 12) + '…' : '↑ Subir'}
                  </label>
                </div>
                {heroImageFile && <p className="text-gold text-[0.65rem] mt-1">Se subirá al guardar: {heroImageFile.name}</p>}
              </div>

              <div className="md:col-span-2 border border-white/10 rounded-xl p-4 space-y-3 bg-white/5">
                <p className="label-caps text-ivory/40 text-[0.6rem]">Ceremonia</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Lugar</label>
                    <input value={draft.ceremonyVenue} onChange={e => setField('ceremonyVenue')(e.target.value)} className={ic} placeholder="Parroquia San Juan" />
                  </div>
                  <div>
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Hora</label>
                    <input value={draft.ceremonyTime} onChange={e => setField('ceremonyTime')(e.target.value)} className={ic} placeholder="17:00" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Direccion</label>
                    <input value={draft.ceremonyAddress} onChange={e => setField('ceremonyAddress')(e.target.value)} className={ic} placeholder="Calle, Colonia, Ciudad" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Foto ceremonia</label>
                    <div className="flex gap-2">
                      <input value={draft.ceremonyPhoto} onChange={e => setField('ceremonyPhoto')(e.target.value)} className={`${ic} flex-1`} placeholder="https://... o /uploads/archivo.jpg" />
                      <label className="btn-outline px-3 py-2 text-xs cursor-pointer flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                        <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && isAllowedImage(f)) setCeremonyPhotoFile(f) }} />
                        {ceremonyPhotoFile ? '✓ ' + ceremonyPhotoFile.name.slice(0, 12) + '…' : '↑ Subir'}
                      </label>
                    </div>
                    {ceremonyPhotoFile && <p className="text-gold text-[0.65rem] mt-1">Se subirá al guardar: {ceremonyPhotoFile.name}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-ivory/80 text-xs font-dm">Enlace Google Maps</label>
                      {(draft.ceremonyVenue || draft.ceremonyAddress) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([draft.ceremonyVenue, draft.ceremonyAddress].filter(Boolean).join(', '))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold text-[0.65rem] font-dm hover:underline flex items-center gap-0.5"
                        >
                          Buscar en Maps →
                        </a>
                      )}
                    </div>
                    <input value={draft.ceremonyMapUrl} onChange={e => setField('ceremonyMapUrl')(e.target.value)} className={ic} placeholder="https://maps.google.com/..." />
                    <p className="text-ivory/30 text-[0.65rem] mt-1">Clic en "Buscar en Maps", luego copia el enlace de tu navegador y pégalo aquí.</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 border border-white/10 rounded-xl p-4 space-y-3 bg-white/5">
                <p className="label-caps text-ivory/40 text-[0.6rem]">Recepcion</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Lugar</label>
                    <input value={draft.receptionVenue} onChange={e => setField('receptionVenue')(e.target.value)} className={ic} placeholder="Salon Magnolia" />
                  </div>
                  <div>
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Hora</label>
                    <input value={draft.receptionTime} onChange={e => setField('receptionTime')(e.target.value)} className={ic} placeholder="19:00" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Direccion</label>
                    <input value={draft.receptionAddress} onChange={e => setField('receptionAddress')(e.target.value)} className={ic} placeholder="Calle, Colonia, Ciudad" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Foto recepción</label>
                    <div className="flex gap-2">
                      <input value={draft.receptionPhoto} onChange={e => setField('receptionPhoto')(e.target.value)} className={`${ic} flex-1`} placeholder="https://... o /uploads/archivo.jpg" />
                      <label className="btn-outline px-3 py-2 text-xs cursor-pointer flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                        <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && isAllowedImage(f)) setReceptionPhotoFile(f) }} />
                        {receptionPhotoFile ? '✓ ' + receptionPhotoFile.name.slice(0, 12) + '…' : '↑ Subir'}
                      </label>
                    </div>
                    {receptionPhotoFile && <p className="text-gold text-[0.65rem] mt-1">Se subirá al guardar: {receptionPhotoFile.name}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-ivory/80 text-xs font-dm">Enlace Google Maps</label>
                      {(draft.receptionVenue || draft.receptionAddress) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([draft.receptionVenue, draft.receptionAddress].filter(Boolean).join(', '))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold text-[0.65rem] font-dm hover:underline flex items-center gap-0.5"
                        >
                          Buscar en Maps →
                        </a>
                      )}
                    </div>
                    <input value={draft.receptionMapUrl} onChange={e => setField('receptionMapUrl')(e.target.value)} className={ic} placeholder="https://maps.google.com/..." />
                    <p className="text-ivory/30 text-[0.65rem] mt-1">Clic en "Buscar en Maps", luego copia el enlace de tu navegador y pégalo aquí.</p>
                  </div>
                </div>
              </div>

              {mode === 'admin' && (
                <div className="md:col-span-2 relative">
                  <label className="block text-ivory/80 text-xs font-dm mb-1.5">Cliente <span className="text-red-400">*</span></label>
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
                  {draft.clientId && <p className="text-green-400 text-xs mt-1 font-dm">Cliente vinculado</p>}
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
                                setClientSearch(`${c.name} - ${c.email}`)
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

              {showOwnerFields && (
                <>
                  <div>
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Tu nombre</label>
                    <input value={draft.ownerName || ''} onChange={e => setField('ownerName')(e.target.value)} className={ic} placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-ivory/80 text-xs font-dm mb-1.5">Tu email</label>
                    <input type="email" value={draft.ownerEmail || ''} onChange={e => setField('ownerEmail')(e.target.value)} className={ic} placeholder="tu@email.com" />
                  </div>
                </>
              )}
            </div>
          )}

          {step === contentStep && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Saludo al invitado (Ej. Hola, Querida...)</label>
                <input value={draft.guestGreeting} onChange={e => setField('guestGreeting')(e.target.value)} className={ic} placeholder="Hola" />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Nombre por defecto (Ej. Familia y Amigos)</label>
                <input value={draft.defaultGuestName} onChange={e => setField('defaultGuestName')(e.target.value)} className={ic} placeholder="Familia y Amigos" />
              </div>
              {([
                { label: 'Mensaje personal', field: 'message', span: true },
                { label: 'Cita o frase especial', field: 'quote', span: true },
                { label: 'Codigo de vestimenta', field: 'dressCode', span: false },
                { label: 'Hashtag', field: 'hashtag', span: false },
              ] as const).map(({ label, field, span }) => (
                <div key={field} className={span ? 'md:col-span-2' : ''}>
                  <label className="block text-ivory/80 text-xs font-dm mb-1.5">{label}</label>
                  <textarea
                    rows={span ? 3 : 2}
                    value={draft.data[field as keyof typeof draft.data]}
                    onChange={e => setData(field)(e.target.value)}
                    className="inv-wizard-field w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none resize-none"
                    placeholder={label}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Papás (uno por linea)</label>
                <textarea
                  rows={3}
                  value={draft.parentsInfo}
                  onChange={e => setField('parentsInfo')(e.target.value)}
                  className="inv-wizard-field w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none resize-none"
                  placeholder="Sra. Maria Lopez & Sr. Juan Perez"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Padrinos (uno por linea)</label>
                <textarea
                  rows={3}
                  value={draft.sponsorsInfo}
                  onChange={e => setField('sponsorsInfo')(e.target.value)}
                  className="inv-wizard-field w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none resize-none"
                  placeholder="Padrinos de brindis: Ana & Luis"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Regalos / Mesa de regalos</label>
                <textarea
                  rows={3}
                  value={draft.giftsInfo}
                  onChange={e => setField('giftsInfo')(e.target.value)}
                  className="inv-wizard-field w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none resize-none"
                  placeholder="Lluvia de sobres o cuenta bancaria..."
                />
              </div>
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Instagram del evento</label>
                <input
                  value={draft.instagramHandle}
                  onChange={e => {
                    const val = e.target.value
                    setField('instagramHandle')(val.startsWith('@') || val === '' ? val : `@${val}`)
                  }}
                  className={ic}
                  placeholder="@nombre_del_evento"
                />
                <p className="text-ivory/30 text-[0.65rem] mt-1">Se mostrara en la invitacion como boton para abrir Instagram.</p>
              </div>
            </div>
          )}

          {step === galleryStep && (
            <div className="space-y-5">
              {savedGallery.length > 0 && (
                <div>
                  <p className="text-ivory/60 text-xs font-dm mb-3">Fotos actuales ({savedGallery.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {savedGallery.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                        <img src={resolveInvitationImageUrl(url)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeletePhoto(i)}
                          className="absolute top-1 right-1 bg-black/70 text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">{savedGallery.length > 0 ? 'Agregar mas fotos' : 'Subir fotos de galeria'}</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={e => {
                    const incoming = Array.from(e.target.files || [])
                    const valid = incoming.filter(isAllowedImage)
                    const invalid = incoming.filter(file => !isAllowedImage(file))
                    setPhotoWarnings(
                      invalid.map(file => `Formato no permitido: ${file.name}. Usa JPG, JPEG, PNG o WEBP.`)
                    )
                    setPhotos(valid.slice(0, 8))
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory/60 text-sm"
                />
                <p className="text-ivory/30 text-xs mt-2">
                  {photos.length > 0 ? `${photos.length} foto(s) seleccionada(s)` : 'Hasta 8 fotos. Se muestran en la galeria de la invitacion.'}
                </p>
                {photoWarnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {photoWarnings.map((msg, idx) => (
                      <p key={`${msg}-${idx}`} className="text-amber-400/80 text-[0.65rem] font-dm">
                        {msg}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Música de fondo ─────────────────────────────────────────── */}
              <div>
                <label className="block text-ivory/80 text-xs font-dm mb-1.5">Música de fondo</label>
                <div
                  className="relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: musicFile ? 'rgba(201,169,110,0.6)' : 'rgba(255,255,255,0.12)',
                    background: musicFile ? 'rgba(201,169,110,0.06)' : 'transparent',
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file && file.type.startsWith('audio/')) setMusicFile(file)
                  }}
                  onClick={() => document.getElementById('music-upload-input')?.click()}
                >
                  <input
                    id="music-upload-input"
                    type="file"
                    accept="audio/mpeg,audio/mp4,audio/ogg,audio/opus,audio/webm,audio/aac,.mp3,.m4a,.ogg,.opus,.webm,.aac"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setMusicFile(file)
                    }}
                  />
                  {musicFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-gold text-lg">♪</span>
                      <div className="text-left">
                        <p className="text-ivory text-xs font-dm truncate max-w-[200px]">{musicFile.name}</p>
                        <p className="text-ivory/40 text-[0.65rem]">{(musicFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button
                        className="text-red-400/60 hover:text-red-400 transition-colors ml-2 text-xs"
                        onClick={e => { e.stopPropagation(); setMusicFile(null) }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : isEdit && draft.backgroundMusic ? (
                    <div className="space-y-1">
                      <p className="text-ivory/60 text-xs font-dm">♪ Música actual configurada</p>
                      <p className="text-ivory/30 text-[0.6rem]">Arrastra o haz clic para reemplazar</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-ivory/50 text-xs font-dm">Arrastra un archivo de audio o haz clic</p>
                      <p className="text-ivory/30 text-[0.6rem]">MP3, M4A, OGG, OPUS — máx. 15 MB</p>
                    </div>
                  )}
                </div>
                <p className="text-amber-400/70 text-[0.62rem] mt-2 font-dm leading-relaxed">
                  ⚠ No añada música con copyright. Use únicamente pistas libres de derechos (royalty-free) o de su propia autoría.
                </p>
              </div>
            </div>
          )}

          {step === publishStep && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/80 text-xs font-dm mb-1.5">Etiqueta RSVP</label>
                  <input value={draft.data.rsvpLabel} onChange={e => setData('rsvpLabel')(e.target.value)} className={ic} placeholder="Confirmar asistencia" />
                </div>
                <div>
                  <label className="block text-ivory/80 text-xs font-dm mb-1.5">Contacto RSVP</label>
                  <input value={draft.data.rsvpValue} onChange={e => setData('rsvpValue')(e.target.value)} className={ic} placeholder="+52 55 1234 5678 o https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-ivory/80 text-xs font-dm mb-1.5">Fecha limite para confirmar asistencia</label>
                  <input type="datetime-local" value={draft.rsvpDeadline} onChange={e => setField('rsvpDeadline')(e.target.value)} className={ic} />
                  <p className="text-ivory/30 text-xs mt-1">Opcional. Los invitados no podran responder despues de esta fecha.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                <div>
                  <p className="text-ivory text-sm font-dm">Publicar invitacion</p>
                  <p className="text-ivory/40 text-xs">Activa el enlace unico y el codigo QR</p>
                </div>
                <button
                  onClick={() => setField('isPublished')(!draft.isPublished)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${draft.isPublished ? 'bg-gold' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${draft.isPublished ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                <div>
                  <p className="text-ivory text-sm font-dm">Número de mesa</p>
                  <p className="text-ivory/40 text-xs">Muestra en la invitación individual la mesa asignada al invitado</p>
                </div>
                <button
                  onClick={() => setDraft(p => ({ ...p, enableTableNumber: !p.enableTableNumber }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${draft.enableTableNumber ? 'bg-gold' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${draft.enableTableNumber ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="border border-white/10 rounded-lg p-4 bg-white/5 flex items-start gap-3">
                <CheckCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
                <div className="text-ivory/60 text-xs font-dm leading-relaxed">
                  {draft.invitationType === 'general'
                    ? `Se generará un enlace único compartible al ${isEdit ? 'actualizar' : 'guardar'}.`
                    : `Se generará un enlace base, luego añades invitados y cada uno recibe su propio enlace personalizado.`
                  }
                </div>
              </div>

              {isEdit && initialData?.shareToken && (
                <div className="border border-white/10 rounded-lg p-4 bg-white/5 space-y-2">
                  <p className="text-ivory/40 text-xs font-dm">
                    {draft.invitationType === 'individual' ? 'Enlace base (comparte a invitados vía su enlace personal)' : 'Enlace general'}
                  </p>
                  <a href={`/invitacion/${initialData.shareToken}`} target="_blank" rel="noopener noreferrer" className="text-gold text-xs font-dm hover:text-gold-light flex items-center gap-1">
                    <Eye size={12} />/invitacion/{initialData.shareToken}
                  </a>
                  {draft.invitationType === 'individual' && (
                    <p className="text-ivory/30 text-[0.6rem] font-dm">Los invitados personalizados usan /g/:token — gestiónalos en el paso Invitados.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex items-center gap-4">
          <div className="flex-1">{error && <p className="text-red-400 text-xs font-dm">{error}</p>}</div>
          <button onClick={prev} disabled={step === 0} className="btn-outline px-4 py-2 text-xs disabled:opacity-40 flex items-center gap-1">
            <ChevronLeft size={14} /> Anterior
          </button>
          {step < publishStep ? (
            <>
              {isEdit && (
                <button onClick={handleSave} disabled={isSaving} className="btn-outline px-4 py-2 text-xs disabled:opacity-60 flex items-center gap-1">
                  {isSaving ? '...' : <><CheckCircle size={13} /> Guardar</>}
                </button>
              )}
              <button onClick={next} className="btn-primary px-5 py-2 text-xs flex items-center gap-1">
                Siguiente <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <button onClick={handleSave} disabled={isSaving} className="btn-primary px-5 py-2 text-xs disabled:opacity-60">
              {isSaving ? 'Guardando...' : isEdit ? 'Actualizar invitacion' : 'Guardar invitacion'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Sub-modal de recorte de imagen */}
      {cropTarget && (
        <ImageCropModal
          file={cropTarget}
          pageLabel={replaceIndex !== null ? `Reemplazar hoja ${replaceIndex + 1}` : `Hoja ${customPages.length + 1}`}
          onConfirm={croppedFile => {
            if (replaceIndex !== null) {
              setCustomPages(prev => prev.map((p, j) => j === replaceIndex ? { kind: 'new' as const, file: croppedFile } : p))
              setReplaceIndex(null)
            } else {
              setCustomPages(prev => [...prev, { kind: 'new' as const, file: croppedFile }])
            }
            setCropTarget(null)
          }}
          onCancel={() => { setCropTarget(null); setReplaceIndex(null) }}
        />
      )}
    </div>
  )
}
