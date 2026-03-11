import SpotlightTour, { TourStep } from '../SpotlightTour'

const GOLD  = '#C9A96E'
const IVORY = '#F5F0E8'

const STEPS: TourStep[] = [
  {
    targetId: null,
    sectionLabel: 'Inicio',
    title: 'Bienvenido a tu Portal',
    body: 'Aquí gestionas tus reservas e invitaciones digitales. Ahora puedes crear invitaciones de tipo General o Individual con RSVP por invitado. El tutorial iluminará cada pestaña en 3 pasos.',
  },
  {
    targetId: 'bookings',
    sectionLabel: 'Mis Reservas',
    title: 'Mis Reservas',
    placement: 'below',
    body: (
      <>
        Consulta el estado de tus reservas activas: <span style={{ color: GOLD }}>Pendiente, Confirmado,
        Depósito pagado, En progreso y Completado.</span> Usa el botón{' '}
        <b style={{ color: IVORY }}>Nueva reserva</b> para solicitar una sesión o evento.
      </>
    ),
    tip: 'Puedes cancelar una reserva siempre que esté en estado Pendiente o Confirmado.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Mis Invitaciones',
    title: 'Mis Invitaciones Digitales',
    placement: 'below',
    body: (
      <>
        El asistente empieza eligiendo el tipo:{' '}
        <span style={{ color: GOLD }}>General</span> (link compartido, 6 pasos) o{' '}
        <span style={{ color: GOLD }}>Individual</span> (enlace personalizado por invitado con RSVP, 7 pasos).
        Elige plantilla, datos del evento, colores y galería. Comparte el link o código QR y monitorea
        las respuestas en tiempo real.
      </>
    ),
    tip: 'Con tipo Individual, el paso "Invitados" te permite agregar personas o familias y ver quién confirmó, está pendiente o declinó.',
  },
  {
    targetId: 'history',
    sectionLabel: 'Historial',
    title: 'Historial',
    placement: 'below',
    body: (
      <>
        Consulta el registro completo de reservas e invitaciones archivadas de todos tus eventos pasados.
        Los elementos archivados <b style={{ color: IVORY }}>no se eliminan</b> — siempre podrás
        consultarlos aquí como referencia.
      </>
    ),
    tip: '¡Tutorial completo! Ahora ya conoces todas las secciones de tu portal.',
  },
]

export default function ClientTutorial() {
  return (
    <SpotlightTour
      tourKey="client_tour_done"
      steps={STEPS}
      selectorAttr="data-client-tour"
      brandLabel="Pedro Vargas Fotografía · Portal del Cliente"
    />
  )
}
