import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Heart, Briefcase, User, Star, Palette, Video } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    num: '01',
    icon: Heart,
    title: 'Bodas & Celebraciones',
    desc: 'Cobertura completa desde los preparativos hasta el último baile. Álbum digital + físico incluido.',
    price: 'Desde $15,000 MXN',
  },
  {
    num: '02',
    icon: Briefcase,
    title: 'Eventos Corporativos',
    desc: 'Cobertura de conferencias, launches, team building y eventos empresariales con entrega express.',
    price: 'Desde $8,000 MXN',
  },
  {
    num: '03',
    icon: User,
    title: 'Retratos & Sesiones',
    desc: 'Sesiones individuales, familiares, boudoir, embarazo y recién nacido en estudio o locación.',
    price: 'Desde $3,500 MXN',
  },
  {
    num: '04',
    icon: Star,
    title: 'XV Años & Graduaciones',
    desc: 'Paquetes especiales con pre-sesión, cobertura del evento y álbum temático.',
    price: 'Desde $12,000 MXN',
  },
  {
    num: '05',
    icon: Palette,
    title: 'Fotografía Editorial',
    desc: 'Sesiones para moda, marcas, producto y campañas publicitarias.',
    price: 'Desde $10,000 MXN',
  },
  {
    num: '06',
    icon: Video,
    title: 'Video + Foto Combo',
    desc: 'Cobertura audiovisual completa con video cinemático 4K + highlight reel.',
    price: 'Desde $20,000 MXN',
  },
]

export default function Services() {
  const { ref, inView } = useInView()

  return (
    <section
      id="servicios"
      className="section-padding bg-[#F1ECE2] dark:bg-[#10100F]"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-14"
        >
          <p className="label-caps text-gold mb-4">Lo que ofrecemos</p>
          <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-2">Servicios</h2>
          <div className="gold-line mt-5" />
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-px bg-[#D8D1C5] dark:bg-white/10">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.num}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="group relative bg-[#F7F4EE] dark:bg-[#161614] p-8 hover:bg-[#FDFCF9] dark:hover:bg-[#1D1D1A] transition-colors duration-400 overflow-hidden"
              >
                {/* Ghost number */}
                <span
                  className="absolute -top-4 -right-2 font-cormorant font-bold text-[8rem] leading-none text-black/6 dark:text-white/5 select-none pointer-events-none group-hover:text-black/10 dark:group-hover:text-white/10 transition-colors duration-500"
                >
                  {service.num}
                </span>

                {/* Number label */}
                <p className="label-caps text-gold/70 text-[0.6rem] mb-5">{service.num}</p>

                {/* Icon */}
                <div className="mb-5 w-10 h-10 flex items-center justify-center border border-black/15 dark:border-white/15 group-hover:border-gold/40 transition-colors duration-400">
                  <Icon className="w-4 h-4 text-black/40 dark:text-white/55 group-hover:text-gold transition-colors duration-400" />
                </div>

                {/* Content */}
                <h3 className="font-cormorant text-ivory text-2xl font-light mb-3 group-hover:text-black dark:group-hover:text-gold transition-colors">
                  {service.title}
                </h3>
                <p className="font-dm text-black/55 dark:text-ivory/60 text-sm leading-relaxed mb-6">{service.desc}</p>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <span className="font-cormorant italic text-gold text-lg">{service.price}</span>
                  <ArrowRight className="w-4 h-4 text-black/25 dark:text-ivory/35 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" />
                </div>

                {/* Bottom gold line */}
                <div className="absolute bottom-0 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-500" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
