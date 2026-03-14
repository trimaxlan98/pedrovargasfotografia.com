import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from './useInView'
import Lightbox from './Lightbox'
import { portfolioFilters, portfolioPhotos, type PortfolioFilter } from '../data/galleryData'

const aspectHeight: Record<string, string> = {
  portrait: 'h-80',
  landscape: 'h-52',
  square: 'h-64',
}

export default function Portfolio() {
  const { ref, inView } = useInView()
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>('Todos')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const filtered =
    activeFilter === 'Todos'
      ? portfolioPhotos
      : portfolioPhotos.filter(photo => photo.filters.includes(activeFilter))

  const openLightbox = (id: number) => {
    const idx = filtered.findIndex(photo => photo.id === id)
    setLightboxIdx(idx)
  }

  return (
    <section
      id="portfolio"
      className="section-padding bg-[#0A0A0A]"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-14"
        >
          <p className="label-caps text-gold mb-4">Seleccion</p>
          <div className="flex items-end gap-6 mb-3">
            <h2 className="font-cormorant text-fluid-section text-ivory font-light">Portfolio</h2>
          </div>
          <p className="font-cormorant italic text-ivory/40 text-xl">Eventos y sesiones seleccionadas</p>
          <div className="gold-line mt-5" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide"
        >
          {portfolioFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-dm font-medium tracking-widest uppercase transition-all duration-300 border ${
                activeFilter === filter
                  ? 'bg-gold border-gold text-black'
                  : 'border-ivory/15 text-ivory/50 hover:border-ivory/40 hover:text-ivory'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="masonry-grid"
          >
            {filtered.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="masonry-item gallery-item group relative overflow-hidden cursor-crosshair"
                onClick={() => openLightbox(photo.id)}
              >
                <div
                  className={`w-full ${aspectHeight[photo.aspect]} relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: photo.position }}
                  />
                  <div
                    className="absolute bottom-1/4 right-1/4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, transparent 70%)',
                      filter: 'blur(20px)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="absolute top-3 left-3">
                    <span className="label-caps text-[0.55rem] text-gold bg-black/60 backdrop-blur-sm px-2 py-1">
                      {photo.type}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <p className="font-cormorant text-ivory text-lg italic">{photo.title}</p>
                    <p className="label-caps text-gold/70 text-[0.55rem] mt-1">Ver mas -&gt;</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-14"
        >
          <button className="btn-outline">Cargar mas trabajos</button>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={filtered}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx(value => Math.max(0, (value ?? 0) - 1))}
            onNext={() => setLightboxIdx(value => Math.min(filtered.length - 1, (value ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
