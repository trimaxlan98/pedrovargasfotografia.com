import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Mail, Phone, MapPin, Instagram, Send, ChevronDown } from 'lucide-react'

const serviceOptions = [
  'Bodas & Celebraciones',
  'Eventos Corporativos',
  'Retratos & Sesiones',
  'XV Años & Graduaciones',
  'Fotografía Editorial',
  'Video + Foto Combo',
  'Invitación Digital',
  'Otro',
]

export default function Contact() {
  const { ref, inView } = useInView()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', date: '', message: '' })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '/api') + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          eventDate: form.date,
          service: form.service,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al enviar')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión. Intenta más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      id="contacto"
      className="section-padding bg-[#0A0A0A]"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 xl:gap-24">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="label-caps text-gold mb-5">Hablemos</p>
            <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-4 leading-tight">
              Reserva tu <br />
              <span className="italic text-gold">Sesión</span>
            </h2>
            <div className="gold-line mb-8" />

            <p className="font-dm text-ivory/50 text-sm leading-relaxed mb-10">
              Cada proyecto comienza con una conversación. Cuéntame sobre tu visión y encontremos juntos la manera perfecta de inmortalizarla.
            </p>

            {/* Contact details */}
            <div className="space-y-5 mb-12">
              {[
                { icon: Mail, label: 'Email', value: 'hola@studiolumiere.mx' },
                { icon: Phone, label: 'Teléfono', value: '+52 55 1234 5678' },
                { icon: MapPin, label: 'Ubicación', value: 'Ciudad de México, CDMX' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-9 h-9 border border-ivory/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-ivory/40" />
                    </div>
                    <div>
                      <p className="label-caps text-ivory/25 text-[0.55rem] mb-0.5">{item.label}</p>
                      <p className="font-dm text-ivory/70 text-sm">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social */}
            <div>
              <p className="label-caps text-ivory/25 text-[0.6rem] mb-3">Síguenos</p>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: '@studiolumiere.mx' },
                ].map(s => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.label}
                      className="flex items-center gap-2 text-ivory/40 hover:text-ivory transition-colors font-dm text-sm"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Business hours */}
            <div className="mt-10 p-5 border border-ivory/8">
              <p className="label-caps text-gold text-[0.6rem] mb-3">Horario de Atención</p>
              <div className="space-y-1.5 font-dm text-ivory/40 text-xs">
                <div className="flex justify-between">
                  <span>Lunes — Viernes</span>
                  <span>9:00 — 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado</span>
                  <span>10:00 — 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-ivory/20">Solo eventos</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="glass p-8 md:p-10"
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full py-16 text-center"
              >
                <div className="w-16 h-16 border border-gold/40 flex items-center justify-center mb-6">
                  <Send className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-cormorant text-ivory text-3xl font-light mb-3">
                  ¡Mensaje enviado!
                </h3>
                <p className="font-dm text-ivory/40 text-sm">
                  Te contactaremos en menos de 24 horas.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-caps text-ivory/35 text-[0.6rem] block mb-2">Nombre completo *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Tu nombre"
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="label-caps text-ivory/35 text-[0.6rem] block mb-2">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="tu@email.com"
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-caps text-ivory/35 text-[0.6rem] block mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+52 55 1234 5678"
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="label-caps text-ivory/35 text-[0.6rem] block mb-2">Fecha tentativa</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={set('date')}
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-caps text-ivory/35 text-[0.6rem] block mb-2">Tipo de servicio *</label>
                  <div className="relative">
                    <select
                      required
                      value={form.service}
                      onChange={set('service')}
                      className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 appearance-none focus:border-gold/40 focus:outline-none transition-colors"
                    >
                      <option value="" disabled>Selecciona un servicio</option>
                      {serviceOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="label-caps text-ivory/35 text-[0.6rem] block mb-2">Cuéntanos más</label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    rows={4}
                    placeholder="Describe tu evento, estilo deseado, número de personas..."
                    className="w-full bg-[#1A1A1A] border border-ivory/10 text-ivory font-dm text-sm px-4 py-3 focus:border-gold/40 focus:outline-none placeholder:text-ivory/20 resize-none transition-colors"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center bg-red-400/10 rounded px-4 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary justify-center gap-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>

                <p className="font-dm text-ivory/20 text-xs text-center">
                  Respuesta garantizada en menos de 24 horas hábiles.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
