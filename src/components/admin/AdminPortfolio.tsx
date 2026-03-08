import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Plus, X, Star, Eye, EyeOff, Trash2, Pencil, Upload, RefreshCw } from 'lucide-react'
import api from '../../api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: string
  title: string
  category: string
  imageUrl: string
  description?: string
  eventDate?: string
  location?: string
  featured: boolean
  order: number
  isVisible: boolean
}

const CATEGORIES = ['Todas', 'Bodas', 'Corporativo', 'Retratos', 'Quince Años', 'Graduaciones', 'Social', 'Editorial']

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''

function imgSrc(url: string) {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterCat, setFilterCat] = useState('Todas')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<PortfolioItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  useEffect(() => { load() }, [])

  async function load() {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: PortfolioItem[] }>('/admin/portfolio?limit=100')
      setItems(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleFeatured(item: PortfolioItem) {
    const fd = new FormData()
    fd.append('featured', String(!item.featured))
    fd.append('title', item.title)
    fd.append('category', item.category)
    try {
      await api.putForm<{ data: PortfolioItem }>(`/admin/portfolio/${item.id}`, fd)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, featured: !i.featured } : i))
    } catch { /* silent */ }
  }

  async function toggleVisible(item: PortfolioItem) {
    const fd = new FormData()
    fd.append('isVisible', String(!item.isVisible))
    fd.append('title', item.title)
    fd.append('category', item.category)
    try {
      await api.putForm<{ data: PortfolioItem }>(`/admin/portfolio/${item.id}`, fd)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isVisible: !i.isVisible } : i))
    } catch { /* silent */ }
  }

  async function deleteItem(id: string) {
    try {
      await api.delete(`/admin/portfolio/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      setDeleteConfirm(null)
    } catch { /* silent */ }
  }

  function openCreate() { setEditTarget(null); setShowForm(true) }
  function openEdit(item: PortfolioItem) { setEditTarget(item); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditTarget(null) }
  function onSaved() { load(); closeForm() }

  const visible = filterCat === 'Todas' ? items : items.filter(i => i.category === filterCat)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-ivory/50 text-sm font-dm">{items.length} fotos en el portfolio</p>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="text-ivory/50 hover:text-gold transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
          >
            <Plus size={16} /> Agregar foto
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-colors ${
              filterCat === cat
                ? 'bg-gold/20 text-gold'
                : 'bg-white/5 text-ivory/50 hover:text-ivory hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="glass rounded-xl border border-white/5 p-12 text-center">
          <Image className="mx-auto text-ivory/20 mb-4" size={40} />
          <p className="text-ivory/40 font-dm">
            {filterCat === 'Todas' ? 'No hay fotos en el portfolio' : `No hay fotos en la categoría "${filterCat}"`}
          </p>
          <button onClick={openCreate} className="btn-outline mt-4 px-5 py-2 text-sm">
            Agregar primera foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map(item => (
            <motion.div
              key={item.id}
              className={`relative group rounded-xl overflow-hidden border ${
                item.isVisible ? 'border-white/10' : 'border-white/5 opacity-50'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: item.isVisible ? 1 : 0.5 }}
            >
              {/* Image */}
              <div className="aspect-square bg-white/5 relative">
                {item.imageUrl && !failedImages[item.id] ? (
                  <img
                    src={imgSrc(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center px-3">
                      <Image size={24} className="text-ivory/20 mx-auto mb-2" />
                      <p className="text-[10px] text-ivory/35 font-dm">Imagen no disponible</p>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold/30 flex items-center justify-center transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} className="text-ivory" />
                  </button>
                  <button
                    onClick={() => toggleFeatured(item)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      item.featured ? 'bg-gold/40 hover:bg-gold/60' : 'bg-white/10 hover:bg-gold/20'
                    }`}
                    title={item.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                  >
                    <Star size={13} className={item.featured ? 'text-gold fill-gold' : 'text-ivory'} />
                  </button>
                  <button
                    onClick={() => toggleVisible(item)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title={item.isVisible ? 'Ocultar' : 'Mostrar'}
                  >
                    {item.isVisible
                      ? <Eye size={13} className="text-ivory" />
                      : <EyeOff size={13} className="text-ivory/60" />
                    }
                  </button>
                  {deleteConfirm === item.id ? (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-8 h-8 rounded-full bg-red-500/40 hover:bg-red-500/60 flex items-center justify-center transition-colors"
                      title="Confirmar eliminación"
                    >
                      <Trash2 size={13} className="text-red-300" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} className="text-ivory/60" />
                    </button>
                  )}
                </div>

                {/* Badges */}
                {item.featured && (
                  <div className="absolute top-2 left-2 bg-gold text-black text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Destacada
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 bg-surface">
                <p className="text-ivory text-xs font-dm truncate">{item.title}</p>
                <p className="text-ivory/40 text-[10px] font-dm">{item.category}</p>
              </div>

              {/* Mobile actions */}
              <div className="md:hidden px-2.5 pb-2.5 bg-surface">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                    title="Editar"
                  >
                    <Pencil size={13} className="text-ivory" />
                  </button>
                  <button
                    onClick={() => toggleFeatured(item)}
                    className={`flex-1 h-8 rounded-lg border flex items-center justify-center ${
                      item.featured
                        ? 'bg-gold/30 border-gold/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                    title={item.featured ? 'Quitar destacado' : 'Marcar destacado'}
                  >
                    <Star size={13} className={item.featured ? 'text-gold fill-gold' : 'text-ivory'} />
                  </button>
                  <button
                    onClick={() => toggleVisible(item)}
                    className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
                    title={item.isVisible ? 'Ocultar' : 'Mostrar'}
                  >
                    {item.isVisible
                      ? <Eye size={13} className="text-ivory" />
                      : <EyeOff size={13} className="text-ivory/60" />
                    }
                  </button>
                  <button
                    onClick={() => deleteConfirm === item.id ? deleteItem(item.id) : setDeleteConfirm(item.id)}
                    className={`flex-1 h-8 rounded-lg border flex items-center justify-center ${
                      deleteConfirm === item.id
                        ? 'bg-red-500/25 border-red-500/40'
                        : 'bg-white/5 border-white/10'
                    }`}
                    title={deleteConfirm === item.id ? 'Confirmar eliminación' : 'Eliminar'}
                  >
                    <Trash2 size={13} className={deleteConfirm === item.id ? 'text-red-300' : 'text-ivory/70'} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <PortfolioForm
            item={editTarget}
            onClose={closeForm}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Portfolio Form Modal ─────────────────────────────────────────────────────

function PortfolioForm({
  item,
  onClose,
  onSaved,
}: {
  item: PortfolioItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = item !== null
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(item ? imgSrc(item.imageUrl) : '')
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: item?.title ?? '',
    category: item?.category ?? 'Bodas',
    description: item?.description ?? '',
    eventDate: item?.eventDate ?? '',
    location: item?.location ?? '',
    order: String(item?.order ?? 0),
    featured: item?.featured ?? false,
    isVisible: item?.isVisible ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEdit && !file) { setError('Selecciona una imagen'); return }
    setIsSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('category', form.category)
      fd.append('description', form.description)
      fd.append('eventDate', form.eventDate)
      fd.append('location', form.location)
      fd.append('order', form.order)
      fd.append('featured', String(form.featured))
      fd.append('isVisible', String(form.isVisible))
      if (file) fd.append('image', file)

      if (isEdit) {
        await api.putForm(`/admin/portfolio/${item.id}`, fd)
      } else {
        await api.postForm('/admin/portfolio', fd)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="w-full max-w-lg bg-[#111111] rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-cormorant text-xl text-ivory">
              {isEdit ? 'Editar foto' : 'Agregar foto'}
            </h3>
            <button onClick={onClose} className="text-ivory/40 hover:text-ivory transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-2">
                Imagen {!isEdit && <span className="text-red-400">*</span>}
              </label>
              <div
                className="relative aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-gold/30 transition-colors cursor-pointer overflow-hidden bg-white/3 flex items-center justify-center"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-ivory/30">
                    <Upload size={28} />
                    <p className="text-xs font-dm">Clic para seleccionar imagen</p>
                  </div>
                )}
                {preview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-ivory text-xs font-dm">Cambiar imagen</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Título <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                required
                placeholder="Ej: Boda en Hacienda San Miguel"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={set('category')}
                className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                {CATEGORIES.slice(1).map(c => (
                  <option key={c} value={c} style={{ backgroundColor: '#1a1a1a' }}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Event date */}
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Fecha del evento</label>
                <input
                  type="text"
                  value={form.eventDate}
                  onChange={set('eventDate')}
                  placeholder="Ej: Marzo 2025"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
                />
              </div>
              {/* Order */}
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Orden</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={set('order')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Ubicación</label>
              <input
                type="text"
                value={form.location}
                onChange={set('location')}
                placeholder="Ej: CDMX, México"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">Descripción</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={2}
                placeholder="Descripción breve..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <Toggle
                label="Destacada"
                checked={form.featured}
                onChange={v => setForm(f => ({ ...f, featured: v }))}
              />
              <Toggle
                label="Visible"
                checked={form.isVisible}
                onChange={v => setForm(f => ({ ...f, isVisible: v }))}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
            )}
          </form>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cancelar
            </button>
            <button
              onClick={handleSubmit as unknown as React.MouseEventHandler}
              disabled={isSaving}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar foto'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Toggle helper ─────────────────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-gold' : 'bg-white/10'}`} />
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
      <span className="text-ivory/60 text-sm font-dm group-hover:text-ivory transition-colors">{label}</span>
    </label>
  )
}
