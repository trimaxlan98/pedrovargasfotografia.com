import SpotlightTour, { TourStep } from '../SpotlightTour'

const GOLD  = '#C9A96E'
const IVORY = '#F5F0E8'

const STEPS: TourStep[] = [
  {
    targetId: null,
    sectionLabel: 'Inicio',
    title: 'Bienvenido al Panel de Control',
    body: 'Cada botón del menú lateral se iluminará en tiempo real mientras avanzas. Completa los 8 pasos para conocer todas las secciones, incluyendo el nuevo sistema de invitaciones con tipos General e Individual.',
  },
  {
    targetId: 'contacts',
    sectionLabel: 'Contactos',
    title: 'Dashboard y Contactos',
    body: (
      <>
        El <b style={{ color: IVORY }}>Dashboard</b> muestra métricas en tiempo real: solicitudes
        pendientes, reservas y clientes activos. En <b style={{ color: IVORY }}>Contactos</b> gestiona
        las solicitudes del formulario público y cámbiales el estado.
      </>
    ),
    tip: 'El badge dorado indica solicitudes que aún no han sido atendidas.',
  },
  {
    targetId: 'bookings',
    sectionLabel: 'Reservas',
    title: 'Reservas',
    body: (
      <>
        Crea y administra reservas con fecha, venue y presupuesto. El flujo de estado:{' '}
        <span style={{ color: GOLD }}>PENDING → CONFIRMED → DEPOSIT_PAID → COMPLETED.</span>
        {' '}Filtra por estado y usa la búsqueda para encontrar reservas rápidamente.
      </>
    ),
    tip: 'Usa "Archivar" para retirar reservas completadas del panel activo sin borrarlas.',
  },
  {
    targetId: 'clients',
    sectionLabel: 'Clientes',
    title: 'Clientes',
    body: (
      <>
        Consulta el historial completo de cada cliente: sus reservas, invitaciones y datos de contacto.
        Desde aquí puedes también crear reservas o invitaciones <b style={{ color: IVORY }}>directamente</b> asignadas a un cliente.
      </>
    ),
    tip: 'Haz clic en un cliente para ver toda su actividad en un solo lugar.',
  },
  {
    targetId: 'accounts',
    sectionLabel: 'Cuentas',
    title: 'Cuentas de Usuario',
    body: (
      <>
        Administra las cuentas de acceso al portal: crea nuevos clientes, restablece contraseñas y
        activa o desactiva accesos. Los usuarios con rol <b style={{ color: IVORY }}>CLIENT</b> solo
        ven su propio portal.
      </>
    ),
    tip: 'Las cuentas inactivas no pueden iniciar sesión pero conservan su historial.',
  },
  {
    targetId: 'portfolio',
    sectionLabel: 'Portfolio',
    title: 'Portfolio',
    body: (
      <>
        Sube y organiza tus fotografías por categoría: Bodas, Corporativo, Retratos, Quinceañeras,
        Graduaciones, Social. Las marcadas como <span style={{ color: GOLD }}>Destacadas</span> aparecen
        en la galería principal del sitio público.
      </>
    ),
    tip: 'El orden de las fotos se puede ajustar para controlar cómo aparecen en el portafolio.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones',
    title: 'Invitaciones Digitales',
    body: (
      <>
        Elige entre dos tipos: <span style={{ color: GOLD }}>General</span> (enlace único compartido,{' '}
        <b style={{ color: IVORY }}>6 pasos</b>) o{' '}
        <span style={{ color: GOLD }}>Individual</span> (enlace por invitado con RSVP,{' '}
        <b style={{ color: IVORY }}>7 pasos</b>). Usa las pestañas{' '}
        <b style={{ color: IVORY }}>Todas / General / Individual</b> para filtrar y monitorea
        confirmaciones, pendientes y declinados en tiempo real.
      </>
    ),
    tip: 'Al crear una invitación Individual, el paso "Invitados" permite agregar personas o familias y copiar su enlace personalizado.',
  },
  {
    targetId: 'settings',
    sectionLabel: 'Configuración',
    title: 'Configuración del Sitio',
    body: (
      <>
        Actualiza teléfono, email, dirección, redes sociales y el texto del{' '}
        <b style={{ color: IVORY }}>Hero</b> del sitio público. Los cambios se reflejan de inmediato
        sin necesidad de redesplegar.
      </>
    ),
    tip: '¡Tutorial completo! Puedes repetirlo limpiando la clave "admin_tour_done" en localStorage.',
  },
]

export default function AdminTutorial() {
  return (
    <SpotlightTour
      tourKey="admin_tour_done"
      steps={STEPS}
      selectorAttr="data-tutorial"
      brandLabel="Pedro Vargas Fotografía · v1.1.2.7.1"
      onStepChange={() => {
        window.dispatchEvent(new CustomEvent('tutorial:open-sidebar'))
      }}
    />
  )
}
