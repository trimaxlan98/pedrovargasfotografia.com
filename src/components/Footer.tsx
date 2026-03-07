import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Instagram, ArrowUp } from 'lucide-react'

const navCols = [
  {
    heading: 'Servicios',
    links: ['Bodas & Celebraciones', 'Eventos Corporativos', 'Retratos & Sesiones', 'XV Años & Graduaciones', 'Fotografía Editorial', 'Video + Foto Combo'],
  },
  {
    heading: 'Estudio',
    links: ['Portfolio', 'Eventos Realizados', 'Sobre Mí', 'Invitaciones Digitales', 'Testimoniales'],
  },
  {
    heading: 'Contacto',
    links: ['hola@studiolumiere.mx', '+52 55 1234 5678', 'CDMX, México', 'Reservar Sesión'],
  },
]

export default function Footer() {
  const { ref, inView } = useInView()

  return (
    <footer
      className="bg-[#EAE5DB] dark:bg-[#0F0F0E] border-t border-black/10 dark:border-white/10"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-[1fr_2fr] gap-16 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-cormorant italic text-[#1C1814] dark:text-[#F7F4EE] text-3xl font-light mb-4">
              Pedro <span className="not-italic font-semibold">Vargas</span>
            </h3>
            <p className="font-dm text-[#333333] dark:text-[#E8E3DB] text-sm leading-relaxed mb-6 max-w-[280px]">
              Capturamos los momentos que definen tu historia. Fotografía profesional en Ciudad de México y toda la República.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 border border-black/20 dark:border-white/25 flex items-center justify-center text-[#444444] dark:text-[#D0CBC3] hover:text-gold hover:border-gold/40 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Nav columns */}
          <div className="grid sm:grid-cols-3 gap-10">
            {navCols.map((col, i) => (
              <motion.div
                key={col.heading}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <p className="label-caps text-gold text-[0.6rem] mb-5">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-dm text-[#444444] dark:text-[#DDD8D0] text-xs hover:text-gold transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/10 dark:border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-dm text-[#444444] dark:text-[#D5D0C8] text-xs">
            © 2026 Pedro Vargas Fotografía. Todos los derechos reservados.
          </p>
          <p className="font-dm text-[#555555] dark:text-[#B8B3AB] text-xs">
            Fotografía Profesional · Ciudad de México
          </p>
          <div className="flex items-center gap-3">
            <span className="label-caps text-[#888888] dark:text-[#6E6E6E] text-[0.55rem]">v1.1.2.4</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-9 h-9 border border-black/15 dark:border-white/20 flex items-center justify-center text-[#555555] dark:text-[#C0BBB3] hover:text-gold hover:border-gold/40 transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
