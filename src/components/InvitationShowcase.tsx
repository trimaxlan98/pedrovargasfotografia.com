import { motion } from 'framer-motion'
import InvitationStrip from './invitations/InvitationStrip'
import { demoInvitation } from './invitations/invitationTypes'
import { useInView } from './useInView'

export default function InvitationShowcase() {
  const { ref, inView } = useInView()
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/invitacion/demo`
    : '/invitacion/demo'

  return (
    <section id="invitacion-demo" className="section-padding bg-[#0f0b08]" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_420px] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="label-caps text-gold mb-4">Plantilla vertical</p>
          <h2 className="font-cormorant text-fluid-section text-ivory font-light mb-4">
            Invitacion en formato tira
          </h2>
          <p className="font-dm text-ivory/60 text-base max-w-xl">
            Cada cliente recibe una micro landing con scroll continuo, optimizada para movil y
            con version desktop centrada. Incluye galeria, mapa, dress code, RSVP y QR compartible.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/invitacion/demo" className="btn-primary">
              Ver demo
            </a>
            <a href="#invitaciones" className="btn-outline">
              Crear invitacion
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="justify-self-center"
        >
          <div
            className="relative"
            style={{ filter: 'drop-shadow(0 40px 80px rgba(201,169,110,0.15))' }}
          >
            <div className="invite-phone-frame w-[300px] bg-[#1e1008]">
              <div className="h-[560px] overflow-y-auto">
                <InvitationStrip invitation={demoInvitation} shareUrl={shareUrl} />
              </div>
            </div>
          </div>
          <p className="text-center font-dm text-ivory/30 text-xs mt-4 tracking-widest uppercase">
            Plantilla Rústica · Desplaza para ver
          </p>
        </motion.div>
      </div>
    </section>
  )
}
