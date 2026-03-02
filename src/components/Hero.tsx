import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const stats = [
  { value: '+500', label: 'Eventos' },
  { value: '12', label: 'Años' },
  { value: '4.9★', label: 'Clientes' },
  { value: '3', label: 'Premios' },
]

const words1 = ['Cada', 'Momento']
const words2 = ['Contado', 'en', 'Luz']

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="inicio" className="relative h-[100svh] min-h-[640px] overflow-hidden flex flex-col">
      {/* Parallax background */}
      <div ref={bgRef} className="absolute inset-0 -top-[20%] film-grain" style={{ willChange: 'transform' }}>
        {/* Warm amber orb */}
        <div
          className="absolute bottom-[5%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,110,0.18) 0%, rgba(180,120,40,0.08) 50%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
        {/* Cool teal orb */}
        <div
          className="absolute top-[5%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(40,80,120,0.15) 0%, rgba(20,60,100,0.05) 60%, transparent 80%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Deep vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* Left — Text */}
          <div>
            {/* Overline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="label-caps text-gold mb-6"
            >
              Fotografía Profesional
            </motion.p>

            {/* H1 line 1 */}
            <div className="overflow-hidden mb-1">
              <div className="flex flex-wrap gap-x-5">
                {words1.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="font-cormorant font-light text-ivory text-fluid-hero inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* H1 line 2 */}
            <div className="overflow-hidden mb-8">
              <div className="flex flex-wrap gap-x-5">
                {words2.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.55 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className={`font-cormorant font-light text-fluid-hero inline-block ${
                      word === 'Luz' ? 'text-gold italic' : 'text-ivory'
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.95 }}
              className="font-cormorant italic text-ivory/50 text-xl md:text-2xl mb-10 tracking-wide"
            >
              Bodas · Corporativo · Retratos · Eventos Sociales
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <button
                className="btn-primary"
                onClick={() => document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Portfolio
              </button>
              <button
                className="btn-outline"
                onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Reservar Ahora
              </button>
            </motion.div>
          </div>

          {/* Right — Portrait Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: 8 }}
            animate={{ opacity: 1, x: 0, rotateY: 3 }}
            transition={{ duration: 1.1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block flex-shrink-0"
            style={{ perspective: '800px' }}
          >
            <div
              className="w-[380px] xl:w-[440px] h-[520px] xl:h-[600px] rounded-sm relative overflow-hidden"
              style={{
                transform: 'rotateY(-4deg) rotateX(2deg)',
                boxShadow: '0 60px 120px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(245,240,232,0.06)',
              }}
            >
              <div className="absolute inset-0 photo-placeholder-warm" />
              {/* Inner bokeh light */}
              <div
                className="absolute bottom-[20%] right-[15%] w-40 h-40 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(201,169,110,0.25) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
              />
              <div
                className="absolute top-[30%] left-[20%] w-20 h-20 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(245,240,232,0.08) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />
              {/* Frame overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="label-caps text-ivory/40 text-[0.6rem]">© Pedro Vargas Fotografía — 2024</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="relative z-10 border-t border-ivory/8"
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between md:justify-start gap-8 md:gap-16 overflow-x-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-shrink-0 text-center md:text-left">
              <p className="font-cormorant text-2xl font-semibold text-ivory">{stat.value}</p>
              <p className="label-caps text-ivory/40 text-[0.6rem] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 lg:bottom-24"
      >
        <span className="label-caps text-ivory/25 text-[0.55rem]">Scroll</span>
        <ChevronDown className="w-4 h-4 text-ivory/30 bounce-slow" />
      </motion.div>
    </section>
  )
}
