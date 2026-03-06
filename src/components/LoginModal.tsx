import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'register' && !form.name.trim()) {
        setError('El nombre es requerido')
        setIsLoading(false)
        return
      }

      const authUser = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password, form.phone)

      onSuccess?.()
      onClose()
      navigate(authUser.role === 'ADMIN' ? '/admin' : '/cliente', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md glass rounded-2xl p-8 shadow-2xl border border-white/10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-ivory/40 hover:text-ivory transition-colors"
            >
              <X size={20} />
            </button>

            {/* Logo */}
            <div className="text-center mb-6">
              <p className="label-caps text-gold text-xs mb-1">Pedro Vargas Fotografía</p>
              <h2 className="font-cormorant text-2xl text-ivory">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 border border-white/10 rounded-lg overflow-hidden">
              {(['login', 'register'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setError('') }}
                  className={`flex-1 py-2.5 text-sm font-dm transition-colors flex items-center justify-center gap-2 ${
                    mode === tab
                      ? 'bg-gold/20 text-gold'
                      : 'text-ivory/50 hover:text-ivory/80'
                  }`}
                >
                  {tab === 'login' ? <><LogIn size={14} />Ingresar</> : <><UserPlus size={14} />Registrarse</>}
                </button>
              ))}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-ivory/60 text-xs font-dm mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="María González"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-ivory/60 text-xs font-dm mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder={mode === 'register' ? 'Mín. 8 chars, mayúscula y número' : '••••••••'}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-ivory/70"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-ivory/60 text-xs font-dm mb-1.5">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+52 55 1234 5678"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-ivory text-sm placeholder-ivory/30 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {error && (
                <motion.p
                  className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg px-4 py-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Procesando...'
                  : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </form>

            {mode === 'login' && (
              <p className="text-center text-ivory/40 text-xs font-dm mt-4">
                ¿Sin cuenta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-gold hover:text-gold-light underline transition-colors"
                >
                  Regístrate aquí
                </button>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
