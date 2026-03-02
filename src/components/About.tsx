import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Award, Camera, Users, Globe } from 'lucide-react'

const highlights = [
  { icon: Camera, value: '+500', label: 'Eventos fotografiados' },
  { icon: Users, value: '12', label: 'Años de experiencia' },
  { icon: Award, value: '3', label: 'Premios internacionales' },
  { icon: Globe, value: '8', label: 'Estados de México' },
]

export default function About() {
  const { ref, inView } = useInView()

  return (
    <section
      id="sobre-mi"
      className="section-padding bg-[#111111]"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Left — Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div
              className="w-full max-w-[480px] h-[580px] photo-placeholder-warm relative overflow-hidden"
              style={{
                boxShadow: '40px 40px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Warm bokeh */}
              <div
                className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              {/* Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

              {/* Floating credential badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-6 left-6 right-6 glass p-4"
              >
                <p className="label-caps text-gold text-[0.55rem] mb-1">Reconocimiento</p>
                <p className="font-cormorant italic text-ivory text-base">
                  Mejor fotógrafo de bodas · WPJA 2023
                </p>
              </motion.div>
            </div>

            {/* Decorative offset element */}
            <div
              className="absolute -bottom-6 -right-6 w-32 h-32 border border-gold/20 hidden lg:block"
              style={{ zIndex: -1 }}
            />
            <div
              className="absolute -top-6 -left-6 w-24 h-24 border border-ivory/5 hidden lg:block"
              style={{ zIndex: -1 }}
            />
          </motion.div>

          {/* Right — Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="label-caps text-gold mb-5">Sobre Mí</p>
            <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-2 leading-tight">
              Una visión, <br />
              <span className="italic text-ivory/60">mil historias.</span>
            </h2>
            <div className="gold-line mb-8" />

            <div className="space-y-5 font-dm text-ivory/55 text-[0.9rem] leading-[1.85] mb-10">
              <p>
                Soy <strong className="text-ivory font-medium">Pedro Vargas</strong>, fotógrafo profesional con más de 12 años capturando los momentos más importantes en la vida de las personas. Mi trabajo va más allá de las fotos: es la preservación de emociones.
              </p>
              <p>
                Formado en la <em className="text-ivory/70">Academia de Artes Visuales de la UNAM</em> y con estudios en Nueva York bajo la tutoría del maestro Robert Klein, mi estilo fusiona la estética cinematográfica internacional con la calidez de la cultura mexicana.
              </p>
              <p>
                Cada sesión es una colaboración. Escucho tu historia antes de hacer una sola fotografía, porque las mejores imágenes nacen de la conexión genuina.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {highlights.map((h, i) => {
                const Icon = h.icon
                return (
                  <motion.div
                    key={h.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-gold/70" />
                    </div>
                    <div>
                      <p className="font-cormorant text-ivory text-2xl font-light">{h.value}</p>
                      <p className="font-dm text-ivory/35 text-xs mt-0.5">{h.label}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <button
              className="btn-outline"
              onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Trabajemos juntos
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
