import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, RefreshCw, Search, Shield, ToggleLeft, ToggleRight,
  User, UserCheck, UserX, X,
} from 'lucide-react'
import api from '../../api/client'

type Role = 'ADMIN' | 'CLIENT'

interface Account {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  isActive: boolean
  createdAt: string
}

interface AccountFormData {
  name: string
  email: string
  phone: string
  password: string
  role: Role
}

type RoleFilter = 'ALL' | Role

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => load(), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search, roleFilter])

  async function load() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '100')
      if (search.trim()) params.set('search', search.trim())
      if (roleFilter !== 'ALL') params.set('role', roleFilter)
      const res = await api.get<{ data: Account[] }>(`/admin/accounts?${params.toString()}`)
      setAccounts(res.data)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleStatus(account: Account) {
    try {
      await api.patch(`/admin/accounts/${account.id}/toggle-status`)
      setAccounts(prev => prev.map(a => (
        a.id === account.id ? { ...a, isActive: !a.isActive } : a
      )))
    } catch {
      // silent
    }
  }

  function onCreated() {
    setShowForm(false)
    load()
  }

  const adminCount = accounts.filter(a => a.role === 'ADMIN').length
  const clientCount = accounts.filter(a => a.role === 'CLIENT').length
  const activeCount = accounts.filter(a => a.isActive).length
  const inactiveCount = accounts.length - activeCount

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-ivory/50 text-sm font-dm">{accounts.length} cuentas</p>
          <span className="text-xs font-dm px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400">
            {adminCount} admin
          </span>
          <span className="text-xs font-dm px-2 py-0.5 rounded-full bg-gold/15 text-gold">
            {clientCount} cliente
          </span>
          <span className="text-xs font-dm px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">
            {activeCount} activas
          </span>
          {inactiveCount > 0 && (
            <span className="text-xs font-dm px-2 py-0.5 rounded-full bg-red-400/10 text-red-400">
              {inactiveCount} inactivas
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="text-ivory/50 hover:text-gold transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Nueva cuenta
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
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
        <div className="flex items-center gap-2">
          {(['ALL', 'ADMIN', 'CLIENT'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-2 rounded-lg text-xs font-dm border transition-colors ${
                roleFilter === role
                  ? 'bg-gold/20 border-gold/40 text-gold'
                  : 'border-white/10 text-ivory/50 hover:text-ivory'
              }`}
            >
              {role === 'ALL' ? 'Todas' : role === 'ADMIN' ? 'Admin' : 'Cliente'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass rounded-xl border border-white/5 p-12 text-center">
          <Shield className="mx-auto text-ivory/20 mb-4" size={40} />
          <p className="text-ivory/40 font-dm">
            {search ? `Sin resultados para "${search}"` : 'No hay cuentas registradas'}
          </p>
          <button onClick={() => setShowForm(true)} className="btn-outline mt-4 px-5 py-2 text-sm">
            Crear cuenta
          </button>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {accounts.map(a => (
              <div key={a.id} className="glass rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-xs font-semibold uppercase">{a.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-ivory text-sm font-dm truncate">{a.name}</p>
                      <p className="text-ivory/50 text-xs truncate">{a.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-dm ${
                    a.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                  }`}>
                    {a.isActive ? <><UserCheck size={11} /> Activa</> : <><UserX size={11} /> Inactiva</>}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-dm">
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Rol</p>
                    <p className={a.role === 'ADMIN' ? 'text-blue-400' : 'text-gold'}>
                      {a.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                  <div>
                    <p className="text-ivory/35 uppercase tracking-wider mb-1">Registro</p>
                    <p className="text-ivory/70">{new Date(a.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(a)}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-dm transition-colors ${
                    a.isActive ? 'text-ivory/70 hover:text-red-400 hover:border-red-400/30' : 'text-ivory/70 hover:text-green-400 hover:border-green-400/30'
                  }`}
                >
                  {a.isActive ? <><ToggleRight size={15} /> Desactivar</> : <><ToggleLeft size={15} /> Activar</>}
                </button>
              </div>
            ))}
          </div>

          <div className="hidden md:block glass rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Cuenta', 'Rol', 'Email', 'Teléfono', 'Registro', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-ivory/40 text-xs font-dm uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accounts.map(a => (
                    <tr key={a.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-gold text-xs font-semibold uppercase">{a.name.charAt(0)}</span>
                          </div>
                          <p className="text-ivory text-sm font-dm">{a.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-dm ${
                          a.role === 'ADMIN' ? 'text-blue-400' : 'text-gold'
                        }`}>
                          {a.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                          {a.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ivory/60 text-sm font-dm">{a.email}</td>
                      <td className="px-4 py-3 text-ivory/50 text-sm font-dm">{a.phone || '-'}</td>
                      <td className="px-4 py-3 text-ivory/40 text-xs font-dm">
                        {new Date(a.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-dm ${
                          a.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                        }`}>
                          {a.isActive
                            ? <><UserCheck size={11} /> Activa</>
                            : <><UserX size={11} /> Inactiva</>
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(a)}
                          className={`flex items-center gap-1 text-xs font-dm transition-colors ${
                            a.isActive ? 'text-ivory/40 hover:text-red-400' : 'text-ivory/40 hover:text-green-400'
                          }`}
                        >
                          {a.isActive
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

      <AnimatePresence>
        {showForm && (
          <AccountForm onClose={() => setShowForm(false)} onCreated={onCreated} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AccountForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<AccountFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CLIENT',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (field: keyof AccountFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await api.post('/admin/accounts', form)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
            <h3 className="font-cormorant text-xl text-ivory">Nueva Cuenta</h3>
            <button onClick={onClose} className="text-ivory/40 hover:text-ivory transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={setField('name')}
                required
                placeholder="Nombre del usuario"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                required
                placeholder="usuario@dominio.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="+52 55 1234 5678"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                  Rol <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={setField('role')}
                  className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm focus:border-gold/50 focus:outline-none"
                  style={{ backgroundColor: '#111111' }}
                >
                  <option value="CLIENT" style={{ backgroundColor: '#111111', color: '#F5F0E8' }}>Cliente</option>
                  <option value="ADMIN" style={{ backgroundColor: '#111111', color: '#F5F0E8' }}>Administrador</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-ivory/60 text-xs font-dm mb-1.5">
                Contraseña inicial <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={setField('password')}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none"
              />
              <p className="text-ivory/30 text-xs font-dm mt-1.5">
                Debe incluir mayúscula, minúscula y número.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary flex-1 py-2.5 text-sm">
                {isSaving ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}
