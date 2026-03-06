import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, X, ToggleLeft, ToggleRight, RefreshCw, UserCheck, UserX } from 'lucide-react'
import api from '../../api/client'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => load(search), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search])

  async function load(q = '') {
    setIsLoading(true)
    try {
      const params = q ? `?search=${encodeURIComponent(q)}&limit=50` : '?limit=50'
      const res = await api.get<{ data: Client[] }>(`/admin/clients${params}`)
      setClients(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleStatus(client: Client) {
    try {
      await api.patch(`/admin/clients/${client.id}/toggle-status`)
      setClients(prev =>
        prev.map(c => c.id === client.id ? { ...c, isActive: !c.isActive } : c)
      )
    } catch { /* silent */ }
  }

  function onCreated() {
    setShowForm(false)
    load(search)
  }

  const active = clients.filter(c => c.isActive).length
  const inactive = clients.filter(c => !c.isActive).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <p className="text-ivory/50 text-sm font-dm">{clients.length} clientes</p>
          <span className="text-xs font-dm text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
            {active} activos
          </span>
          {inactive > 0 && (
            <span className="text-xs font-dm text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
              {inactive} inactivos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(search)}
            className="text-ivory/50 hover:text-gold transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
          >
            <Plus size={16} /> Nuevo cliente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="glass rounded-xl border border-white/5 p-12 text-center">
          <Users className="mx-auto text-ivory/20 mb-4" size={40} />
          <p className="text-ivory/40 font-dm">
            {search ? `Sin resultados para "${search}"` : 'No hay clientes registrados'}
          </p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="btn-outline mt-4 px-5 py-2 text-sm">
              Crear primer cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {clients.map(c => (
              <div key={c.id} className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-xs font-semibold uppercase">{c.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-ivory text-sm font-dm truncate">{c.name}</p>
                      <p className="text-ivory/50 text-xs truncate">{c.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-dm ${
                    c.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                  }`}>
                    {c.isActive ? <><UserCheck size={11} /> Activo</> : <><UserX size={11} /> Inactivo</>}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-dm">
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Telefono</p>
                    <p className="text-ivory/70">{c.phone ?? 'No definido'}</p>
                  </div>
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Registro</p>
                    <p className="text-ivory/70">{new Date(c.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(c)}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-dm transition-colors ${
                    c.isActive ? 'text-ivory/70 hover:text-red-400 hover:border-red-400/30' : 'text-ivory/70 hover:text-green-400 hover:border-green-400/30'
                  }`}
                  title={c.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                >
                  {c.isActive ? <><ToggleRight size={15} /> Desactivar</> : <><ToggleLeft size={15} /> Activar</>}
                </button>
              </div>
            ))}
          </div>

          <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Cliente', 'Email', 'Telefono', 'Registro', 'Estado', 'Accion'].map(h => (
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
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-gold text-xs font-semibold uppercase">
                              {c.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-ivory text-sm font-dm">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ivory/60 text-sm font-dm">{c.email}</td>
                      <td className="px-4 py-3 text-ivory/50 text-sm font-dm">
                        {c.phone ?? <span className="text-ivory/20">-</span>}
                      </td>
                      <td className="px-4 py-3 text-ivory/40 text-xs font-dm">
                        {new Date(c.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-dm ${
                          c.isActive
                            ? 'text-green-400 bg-green-400/10'
                            : 'text-red-400 bg-red-400/10'
                        }`}>
                          {c.isActive
                            ? <><UserCheck size={11} /> Activo</>
                            : <><UserX size={11} /> Inactivo</>
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(c)}
                          className={`flex items-center gap-1 text-xs font-dm transition-colors ${
                            c.isActive
                              ? 'text-ivory/40 hover:text-red-400'
                              : 'text-ivory/40 hover:text-green-400'
                          }`}
                          title={c.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                        >
                          {c.isActive
                            ? <><ToggleRight size={16} /> Desactivar</>
                            : <><ToggleLeft size={16} /> Activar</>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create client modal */}
      <AnimatePresence>
        {showForm && (
          <ClientForm onClose={() => setShowForm(false)} onCreated={onCreated} />
        )}
      </AnimatePresence>
    </div>
  )
}

// â”€â”€â”€ Create Client Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ClientForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await api.post('/admin/clients', form)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
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
        <div className="w-full max-w-md bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-cormorant text-xl text-ivory">Nuevo Cliente</h3>
            <button onClick={onClose} className="text-ivory/40 hover:text-ivory transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {[
              { label: 'Nombre completo', field: 'name', type: 'text', placeholder: 'Ana GarcÃ­a LÃ³pez', required: true },
              { label: 'Correo electrÃ³nico', field: 'email', type: 'email', placeholder: 'ana@ejemplo.com', required: true },
              { label: 'TelÃ©fono', field: 'phone', type: 'tel', placeholder: '+52 55 1234 5678', required: false },
              { label: 'ContraseÃ±a inicial', field: 'password', type: 'password', placeholder: 'MÃ­n. 8 caracteres', required: false },
            ].map(({ label, field, type, placeholder, required }) => (
              <div key={field}>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={set(field)}
                  required={required}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
                />
              </div>
            ))}

            <p className="text-ivory/30 text-xs font-dm">
              Si no se especifica contraseÃ±a, se usarÃ¡ <code className="text-gold">Cliente123!</code> como temporal.
            </p>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary flex-1 py-2.5 text-sm">
                {isSaving ? 'Creando...' : 'Crear Cliente'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

