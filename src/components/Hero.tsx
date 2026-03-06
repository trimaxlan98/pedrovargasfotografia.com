import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { profilePhotos } from '../data/galleryData'

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
    <section id="inicio" className="relative h-[100svh] min-h-[640px] overflow-hidden flex flex-col bg-[#F7F4EE]">
      {/* Ambient orbs */}
      <div ref={bgRef} className="absolute inset-0 film-grain pointer-events-none" style={{ willChange: 'transform' }}>
        <div
          className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,110,0.14) 0%, rgba(180,120,40,0.05) 50%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute top-[5%] right-[30%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(40,80,120,0.08) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
          {/* Left — Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="label-caps text-gold mb-6"
            >
              Fotografía Profesional
            </motion.p>

            <div className="overflow-hidden mb-1">
              <div className="flex flex-wrap gap-x-5">
                {words1.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="font-cormorant font-light text-[#0A0A0A] text-fluid-hero inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="overflow-hidden mb-8">
              <div className="flex flex-wrap gap-x-5">
                {words2.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.55 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className={`font-cormorant font-light text-fluid-hero inline-block ${
                      word === 'Luz' ? 'text-gold italic' : 'text-[#0A0A0A]'
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.95 }}
              className="font-cormorant italic text-[#0A0A0A]/45 text-xl md:text-2xl mb-10 tracking-wide"
            >
              Bodas · Corporativo · Retratos · Eventos Sociales
            </motion.p>

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

          {/* Right — Landscape image card */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block flex-shrink-0"
          >
            <div
              className="w-[500px] xl:w-[560px] h-[340px] xl:h-[380px] rounded-sm relative overflow-hidden"
              style={{
                boxShadow: '0 40px 90px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(0,0,0,0.06)',
              }}
            >
              <img
                src={profilePhotos.hero.src}
                alt={profilePhotos.hero.alt}
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: '50% 0%' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.45) 0%, transparent 45%)' }}
              />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="label-caps text-white/55 text-[0.6rem]">© Pedro Vargas Fotografía — 2024</p>
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
        className="relative z-10 border-t border-black/10"
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between md:justify-start gap-8 md:gap-16 overflow-x-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-shrink-0 text-center md:text-left">
              <p className="font-cormorant text-2xl font-semibold text-[#0A0A0A]">{stat.value}</p>
              <p className="label-caps text-[#0A0A0A]/40 text-[0.6rem] mt-0.5">{stat.label}</p>
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
        <span className="label-caps text-[#0A0A0A]/25 text-[0.55rem]">Scroll</span>
        <ChevronDown className="w-4 h-4 text-[#0A0A0A]/30 bounce-slow" />
      </motion.div>
    </section>
  )
}
