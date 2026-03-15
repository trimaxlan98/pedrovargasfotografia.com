import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { profilePhotos, portfolioPhotos, eventsData } from '../data/galleryData'

const carouselPhotos = [
  { src: profilePhotos.hero.src, alt: profilePhotos.hero.alt, position: profilePhotos.hero.position },
  ...portfolioPhotos.map(p => ({ src: p.src, alt: p.alt, position: p.position })),
  ...eventsData.map(e => ({ src: e.src, alt: e.alt, position: e.position })),
]

const INTERVAL = 5000

const stats = [
  { value: '+500', label: 'Eventos' },
  { value: '12',   label: 'Años'   },
  { value: '4.9★', label: 'Clientes' },
  { value: '3',    label: 'Premios' },
]

const words1 = ['Cada', 'Momento']
const words2 = ['Contado', 'en', 'Luz']

export default function Hero() {
  const [currentPhoto, setCurrentPhoto] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentPhoto(prev => (prev + 1) % carouselPhotos.length),
      INTERVAL,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    /*
     * isolation: isolate  → creates a stacking context so nothing bleeds out
     * overflow-hidden     → hard clip — no child can escape the section bounds
     * NO translateY parallax — was breaking the clip on scroll
     */
    <section
      id="inicio"
      className="relative h-[100svh] min-h-[640px] flex flex-col bg-[#0A0A0A] overflow-hidden"
      style={{ isolation: 'isolate' }}
    >

      {/* ── Carousel background — strictly contained ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={currentPhoto}
            src={carouselPhotos[currentPhoto].src}
            alt={carouselPhotos[currentPhoto].alt}
            loading="eager"
            /*
             * Ken Burns: each photo slowly zooms out over its lifetime.
             * No translateY → no overflow.
             */
            initial={{ opacity: 0, scale: 1.10 }}
            animate={{ opacity: 1, scale: 1.00 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              opacity: { duration: 1.4, ease: 'easeInOut' },
              scale:   { duration: INTERVAL / 1000, ease: 'linear' },
            }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: carouselPhotos[currentPhoto].position }}
          />
        </AnimatePresence>
      </div>

      {/* ── Gradient: RIGHT is clean photo / CENTER-LEFT darkens for text ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: [
            /*
             * Primary curtain: fully transparent on the right half,
             * starts darkening at ~45% and reaches near-black on the left edge.
             * This is the "from center to left" the user requested.
             */
            'linear-gradient(to left, ' +
              'rgba(3,2,1,0.00)  0%,  ' +
              'rgba(3,2,1,0.00) 12%,  ' +
              'rgba(3,2,1,0.38) 38%,  ' +
              'rgba(3,2,1,0.76) 58%,  ' +
              'rgba(3,2,1,0.92) 72%,  ' +
              'rgba(3,2,1,0.97) 100%' +
            ')',
            /* Top vignette — protects the navbar area */
            'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 22%)',
            /* Bottom vignette — merges into the stats strip */
            'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 28%)',
          ].join(', '),
        }}
      />

      {/* ── Film grain ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] pointer-events-none film-grain"
        style={{ opacity: 0.032 }}
      />

      {/* ── Text content ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="label-caps text-gold mb-6"
          >
            Fotografía Profesional
          </motion.p>

          {/* "Cada Momento" */}
          <div className="overflow-hidden mb-0.5">
            <div className="flex flex-wrap gap-x-[0.3em]">
              {words1.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.38 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  className="font-cormorant font-light text-fluid-hero inline-block text-[#F5F0E8]"
                  style={{ textShadow: '0 2px 18px rgba(0,0,0,0.45)' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          {/* "Contado en Luz" */}
          <div className="overflow-hidden mb-4 md:mb-9">
            <div className="flex flex-wrap gap-x-[0.3em]">
              {words2.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.52 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  className={`font-cormorant font-light text-fluid-hero inline-block ${
                    word === 'Luz' ? 'text-gold italic' : 'text-[#F5F0E8]'
                  }`}
                  style={{ textShadow: '0 2px 18px rgba(0,0,0,0.45)' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="font-cormorant italic text-[#F5F0E8]/85 text-base sm:text-xl md:text-2xl mb-6 md:mb-10 tracking-wide"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
          >
            Bodas · Corporativo · Retratos · Eventos Sociales
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.12 }}
            className="flex flex-wrap gap-4"
          >
            <button
              className="btn-primary"
              onClick={() => document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Portfolio
            </button>
            <button
              className="btn-outline-light"
              onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Reservar Ahora
            </button>
          </motion.div>

        </div>
      </div>

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="relative z-10 border-t border-white/10"
        style={{
          background: 'rgba(0,0,0,0.42)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-4 md:py-5 flex items-center gap-4 sm:gap-8 md:gap-16 overflow-x-auto">
          {stats.map(stat => (
            <div key={stat.label} className="flex-shrink-0 text-center md:text-left">
              <p className="font-cormorant text-2xl font-semibold text-[#F5F0E8]">{stat.value}</p>
              <p className="label-caps text-[#F5F0E8]/38 text-[0.6rem] mt-0.5">{stat.label}</p>
            </div>
          ))}
          <p className="ml-auto flex-shrink-0 label-caps text-[0.52rem] hidden sm:block" style={{ color: '#F5F0E880' }}>
            © Pedro Vargas Fotografía — 2026
          </p>
        </div>
      </motion.div>

      {/* ── Carousel progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20 bg-white/10">
        <motion.div
          key={currentPhoto}
          className="h-full bg-gold/65"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
        />
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.65, duration: 0.6 }}
        className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="label-caps text-[0.52rem]" style={{ color: '#F5F0E8A6' }}>Scroll</span>
        <ChevronDown className="w-4 h-4 bounce-slow" style={{ color: '#F5F0E899' }} />
      </motion.div>


    </section>
  )
}
