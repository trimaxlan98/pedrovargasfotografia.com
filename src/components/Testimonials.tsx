import { motion } from 'framer-motion'
import { useInView } from './useInView'

const testimonials = [
  {
    quote: 'Las fotos de nuestra boda superaron todas nuestras expectativas. Capturó momentos que ni siquiera vimos en el momento.',
    name: 'Mariana & Roberto',
    event: 'Boda · Hacienda San Rafael',
    initials: 'MR',
    gradient: 'from-amber-900/40 to-amber-700/20',
  },
  {
    quote: 'Profesionalismo absoluto. Entregó 600 imágenes editadas en menos de 48 horas. Nuestros clientes quedaron encantados.',
    name: 'Alejandro Fuentes',
    event: 'Evento Corporativo · WTC México',
    initials: 'AF',
    gradient: 'from-blue-900/40 to-blue-700/20',
  },
  {
    quote: 'Mi quinceañero quedó de película. Las fotos tienen una calidad cinematográfica que no había visto en la zona.',
    name: 'Sofía Rodríguez',
    event: 'XV Años · Salón Versalles',
    initials: 'SR',
    gradient: 'from-rose-900/40 to-rose-700/20',
  },
  {
    quote: 'Contratar su servicio fue la mejor decisión. La sesión de retratos para mi familia fue relajada y los resultados, espectaculares.',
    name: 'Carlos & Familia Herrera',
    event: 'Retratos Familiares',
    initials: 'CH',
    gradient: 'from-emerald-900/40 to-emerald-700/20',
  },
  {
    quote: 'Para nuestra campaña de moda necesitábamos alguien con visión artística. Pedro Vargas Fotografía lo tiene de sobra.',
    name: 'Valeria Montoya',
    event: 'Editorial · Moda',
    initials: 'VM',
    gradient: 'from-purple-900/40 to-purple-700/20',
  },
  {
    quote: 'La graduación de mi hija quedó inmortalizada de manera que jamás olvidaremos. Cada foto, una obra de arte.',
    name: 'Patricia González',
    event: 'Graduación · UNAM',
    initials: 'PG',
    gradient: 'from-indigo-900/40 to-indigo-700/20',
  },
  {
    quote: 'El video cinemático de nuestro evento empresarial nos ayudó a comunicar nuestra marca de manera impactante.',
    name: 'Grupo Innovar',
    event: 'Video + Foto · Corporativo',
    initials: 'GI',
    gradient: 'from-teal-900/40 to-teal-700/20',
  },
  {
    quote: 'Puntual, discreto, creativo. Exactamente lo que necesitamos para nuestros eventos de alto perfil.',
    name: 'Laura Ángeles',
    event: 'Eventos Sociales · CDMX',
    initials: 'LA',
    gradient: 'from-orange-900/40 to-orange-700/20',
  },
]

// Duplicate for infinite scroll
const doubled = [...testimonials, ...testimonials]

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-gold text-xs">★</span>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const { ref, inView } = useInView()

  return (
    <section
      className="section-padding bg-[#EDE8DE] dark:bg-[#0D0D0C] overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="label-caps text-gold mb-4">Reseñas</p>
          <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-2">
            Lo que dicen nuestros clientes
          </h2>
          <div className="gold-line mt-5" />
        </motion.div>
      </div>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="overflow-hidden"
      >
        <div className="flex marquee-track" style={{ width: 'max-content' }}>
          {doubled.map((t, i) => (
            <div
              key={i}
              className="w-[340px] flex-shrink-0 mx-3 glass p-6 flex flex-col gap-4"
            >
              <Stars />
              <p className="font-cormorant italic text-ivory/90 text-lg leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-black/12 dark:border-white/12">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="font-dm text-xs font-semibold text-white/80">{t.initials}</span>
                </div>
                <div>
                  <p className="font-dm text-ivory font-semibold text-sm leading-tight">{t.name}</p>
                  <p className="font-dm text-ivory/60 text-xs mt-0.5">{t.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
