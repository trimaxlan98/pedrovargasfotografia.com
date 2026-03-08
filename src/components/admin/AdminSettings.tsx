import { useEffect, useState } from 'react'
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle, FileText, Type, Save, RefreshCw } from 'lucide-react'
import api from '../../api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteSettings {
  phone: string
  email: string
  address: string
  instagram?: string
  facebook?: string
  whatsapp?: string
  aboutText?: string
  heroTitle: string
  heroSubtitle?: string
}

// ─── Sections config ──────────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: 'Contacto',
    fields: [
      { key: 'phone',   label: 'Teléfono',         icon: Phone,   type: 'text',  placeholder: '+52 55 1234 5678' },
      { key: 'email',   label: 'Email de contacto', icon: Mail,    type: 'email', placeholder: 'hola@estudio.mx' },
      { key: 'address', label: 'Dirección',         icon: MapPin,  type: 'text',  placeholder: 'Ciudad de México, CDMX' },
    ],
  },
  {
    title: 'Redes sociales',
    fields: [
      { key: 'instagram', label: 'Instagram',  icon: Instagram,       type: 'text', placeholder: '@pedrovargas.foto' },
      { key: 'facebook',  label: 'Facebook',   icon: Facebook,        type: 'text', placeholder: 'pedrovargasfotografia' },
      { key: 'whatsapp',  label: 'WhatsApp',   icon: MessageCircle,   type: 'text', placeholder: '+52 55 1234 5678' },
    ],
  },
  {
    title: 'Hero (portada)',
    fields: [
      { key: 'heroTitle',    label: 'Título principal', icon: Type,     type: 'text', placeholder: 'Cada Momento Contado en Luz' },
      { key: 'heroSubtitle', label: 'Subtítulo',        icon: FileText, type: 'text', placeholder: 'Subtítulo opcional...' },
    ],
  },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [form, setForm] = useState<Partial<SiteSettings>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: SiteSettings }>('/admin/settings')
      setForm(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar configuración')
    } finally {
      setIsLoading(false)
    }
  }

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await api.put('/admin/settings', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-ivory/50 text-sm font-dm">
          Configuración general del sitio
        </p>
        <button
          type="button"
          onClick={load}
          className="text-ivory/50 hover:text-gold transition-colors"
          title="Recargar"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Field sections */}
      {SECTIONS.map(section => (
        <div key={section.title} className="glass rounded-xl border border-white/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 bg-white/2">
            <p className="label-caps text-gold text-xs">{section.title}</p>
          </div>
          <div className="p-5 space-y-4">
            {section.fields.map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="flex items-center gap-2 text-ivory/60 text-xs font-dm mb-1.5">
                  <Icon size={12} className="text-gold" />
                  {label}
                </label>
                <input
                  type={type}
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* About text */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 bg-white/2">
          <p className="label-caps text-gold text-xs">Sobre nosotros</p>
        </div>
        <div className="p-5">
          <label className="flex items-center gap-2 text-ivory/60 text-xs font-dm mb-1.5">
            <FileText size={12} className="text-gold" />
            Texto sobre el fotógrafo
          </label>
          <textarea
            value={form.aboutText ?? ''}
            onChange={set('aboutText')}
            rows={5}
            placeholder="Escribe aquí la biografía o descripción del estudio..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Errors / feedback */}
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
      )}

      {saved && (
        <p className="text-green-400 text-sm bg-green-400/10 rounded-lg px-4 py-2 flex items-center gap-2">
          <Save size={14} /> Configuración guardada correctamente
        </p>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary px-8 py-2.5 text-sm flex items-center gap-2"
        >
          <Save size={15} />
          {isSaving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  )
}
