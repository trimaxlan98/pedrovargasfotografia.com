import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, CheckCircle, LogOut } from 'lucide-react'
import api from '../../api/client'

interface Props {
  onAccepted: () => void
  onDeclined: () => void
}

export default function TermsModal({ onAccepted, onDeclined }: Props) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [declined, setDeclined] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 60) {
      setHasScrolled(true)
    }
  }

  const handleAccept = async () => {
    setLoading(true)
    setError('')
    try {
      await api.patch('/auth/accept-terms')
      onAccepted()
    } catch {
      setError('Ocurrió un error al registrar tu aceptación. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (declined) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
          className="w-full max-w-md glass rounded-2xl border border-white/10 p-8 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
            <LogOut className="text-danger" size={28} />
          </div>
          <h2 className="font-cormorant text-2xl text-ivory mb-3">Acceso restringido</h2>
          <p className="text-ivory/60 font-dm text-sm leading-relaxed mb-6">
            Para utilizar el portal de clientes es necesario aceptar los Términos y Condiciones de servicio.
            Puedes revisarlos en cualquier momento antes de aceptar.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeclined(false)}
              className="flex-1 btn-outline py-2.5 text-sm"
            >
              Revisar términos
            </button>
            <button
              onClick={onDeclined}
              className="flex-1 py-2.5 text-sm rounded-lg border border-danger/40 text-danger hover:bg-danger/10 transition-colors font-dm"
            >
              Salir
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-2xl glass rounded-2xl border border-white/10 flex flex-col"
        style={{ maxHeight: '90vh' }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
              <ScrollText className="text-gold" size={18} />
            </div>
            <div>
              <p className="label-caps text-gold text-xs">Antes de continuar</p>
              <h2 className="font-cormorant text-xl text-ivory leading-tight">Términos y Condiciones de Servicio</h2>
            </div>
          </div>
          <p className="text-ivory/45 text-xs font-dm mt-3 leading-relaxed">
            Por favor, lee con atención los términos que rigen el uso del portal.
            Desplázate hasta el final para habilitar el botón de aceptación.
          </p>
        </div>

        {/* Scrollable content */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-5 text-ivory/65 text-sm font-dm space-y-5 leading-relaxed"
          style={{ minHeight: 0 }}
        >
          <Section title="1. Uso de la plataforma">
            Esta aplicación proporciona herramientas para la gestión de sesiones fotográficas, galerías
            privadas, reservas y creación de invitaciones digitales. El acceso es exclusivo para clientes
            mayores de 18 años que hayan contratado o estén en proceso de contratar un servicio.
          </Section>

          <Section title="2. Reservas y contratación">
            La solicitud de reserva constituye únicamente una solicitud de disponibilidad. El servicio se
            confirma con respuesta escrita del Fotógrafo y, cuando aplique, el pago del depósito acordado.
            Las cancelaciones con menos de 30 días de anticipación implican la pérdida del depósito.
          </Section>

          <Section title="3. Propiedad intelectual y derechos de autor">
            Todas las fotografías y material audiovisual son creaciones originales del Fotógrafo, protegidas
            por la ley de derechos de autor. Se otorga al Cliente una licencia de uso personal, no comercial.
            Queda prohibido revender, modificar sustancialmente o usar el material con fines publicitarios
            sin autorización expresa por escrito.
          </Section>

          <Section title="4. Autorización de uso promocional">
            Al aceptar estos términos, el Cliente autoriza al Fotógrafo a utilizar las imágenes resultantes
            del servicio en su portafolio web, redes sociales oficiales y materiales promocionales. Esta
            autorización es gratuita y puede revocarse mediante acuerdo escrito de confidencialidad previo
            al evento.
          </Section>

          <Section title="5. Portal de clientes e invitaciones digitales">
            El Cliente es responsable de la confidencialidad de sus credenciales y de la exactitud del
            contenido introducido en las invitaciones. Las galerías e invitaciones tienen una vigencia
            establecida en el contrato. Se recomienda descargar el material dentro del período activo.
          </Section>

          <Section title="6. Protección de datos personales">
            Los datos proporcionados (nombre, correo, teléfono, datos del evento) se tratan exclusivamente
            para la prestación del servicio. No son vendidos ni cedidos a terceros. Las contraseñas se
            almacenan cifradas. El Cliente tiene derecho de acceso, rectificación y cancelación de datos.
            La plataforma registra la actividad del usuario con fines de seguridad y soporte interno.
          </Section>

          <Section title="7. Limitación de responsabilidad">
            El Fotógrafo no será responsable por daños indirectos derivados del uso del Servicio. La
            responsabilidad máxima estará limitada al monto pagado por el servicio específico. En
            imprevistos del evento por causas ajenas (condiciones del venue, cortes eléctricos, etc.)
            no procede devolución, pero se acordarán compensaciones razonables.
          </Section>

          <Section title="8. Entrega y respaldo de material">
            Se recomienda descargar el material entregado dentro de los primeros 30 días. El Fotógrafo
            conservará copia por el período pactado. Los archivos RAW no forman parte del servicio estándar.
          </Section>

          <Section title="9. Conducta del usuario">
            El Cliente se compromete a tratar con respeto al personal y al Fotógrafo. El uso de la
            plataforma para publicar contenido ilegal o difamatorio resulta en suspensión inmediata.
          </Section>

          <Section title="10. Vigencia y modificaciones">
            Estos Términos pueden modificarse con notificación previa. El uso continuado de la plataforma
            tras la publicación de cambios implica su aceptación. La cuenta permanece activa mientras
            exista relación de servicio vigente o hasta solicitud de baja.
          </Section>

          <Section title="11. Ley aplicable">
            Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia
            se intentará resolver mediante acuerdo directo y, de no lograrse, ante los tribunales
            competentes de la Ciudad de México.
          </Section>

          <div className="pt-2 pb-1 border-t border-white/10">
            <p className="text-ivory/40 text-xs text-center">
              Pedro Vargas Fotografía · Ciudad de México · Versión 2.0 · 6 de marzo de 2026
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
          {!hasScrolled && (
            <p className="text-center text-ivory/35 text-xs font-dm mb-3">
              Desplázate hasta el final del documento para habilitar la aceptación
            </p>
          )}
          {hasScrolled && !error && (
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-xs font-dm">Has leído el documento completo</p>
            </div>
          )}
          {error && (
            <p className="text-red-400 text-xs font-dm text-center mb-3 bg-red-400/10 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setDeclined(true)}
              className="btn-outline px-5 py-2.5 text-sm"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasScrolled || loading}
              className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border border-black/40 border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : (
                'Aceptar y Continuar'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-ivory text-sm font-dm font-semibold mb-1.5">{title}</h3>
      <p className="text-ivory/60 text-sm font-dm leading-relaxed">{children}</p>
    </div>
  )
}
