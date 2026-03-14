import SpotlightTour, { TourStep } from '../SpotlightTour'

const GOLD  = '#C9A96E'
const IVORY = '#F5F0E8'
const DIM   = 'rgba(245,240,232,0.55)'

const STEPS: TourStep[] = [
  {
    targetId: null,
    sectionLabel: 'Inicio',
    title: 'Bienvenido al Panel de Control',
    body: (
      <>
        Este tour de <b style={{ color: IVORY }}>10 pasos</b> cubre cada sección del panel.
        Los botones del menú lateral se iluminan en tiempo real mientras avanzas.
        Puedes repetirlo cuando quieras desde Configuración.
      </>
    ),
  },
  {
    targetId: 'contacts',
    sectionLabel: 'Contactos',
    title: 'Dashboard y Contactos',
    body: (
      <>
        El <b style={{ color: IVORY }}>Dashboard</b> muestra métricas en tiempo real:
        solicitudes pendientes, reservas activas y clientes registrados.{' '}
        En <b style={{ color: IVORY }}>Contactos</b> gestiona las solicitudes que llegan
        del formulario público — cambia su estado y conviértelas en reserva con un clic.
      </>
    ),
    tip: 'El badge dorado en el menú indica solicitudes sin atender.',
  },
  {
    targetId: 'bookings',
    sectionLabel: 'Reservas',
    title: 'Reservas',
    body: (
      <>
        Crea y administra reservas con fecha, venue y presupuesto. Flujo de estado:{' '}
        <span style={{ color: GOLD }}>PENDING → CONFIRMED → DEPOSIT_PAID → IN_PROGRESS → COMPLETED.</span>
        {' '}Filtra por estado y usa la búsqueda para localizar reservas rápidamente.
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
        Consulta el historial completo de cada cliente: reservas, invitaciones y datos de contacto.
        Desde aquí puedes crear reservas o invitaciones{' '}
        <b style={{ color: IVORY }}>directamente asignadas</b> a un cliente sin que él
        tenga que iniciarlas.
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
        Administra los accesos al portal: crea nuevos clientes, restablece contraseñas y
        activa o desactiva cuentas. Los usuarios con rol{' '}
        <b style={{ color: IVORY }}>CLIENT</b> solo ven su propio portal; el rol{' '}
        <b style={{ color: IVORY }}>ADMIN</b> tiene acceso total.
      </>
    ),
    tip: 'Las cuentas inactivas no pueden iniciar sesión pero conservan su historial completo.',
  },
  {
    targetId: 'portfolio',
    sectionLabel: 'Portfolio',
    title: 'Portfolio',
    body: (
      <>
        Sube y organiza fotografías por categoría:{' '}
        <span style={{ color: GOLD }}>Bodas, Corporativo, Retratos, Quinceañeras, Graduaciones, Social.</span>
        {' '}Las marcadas como <b style={{ color: IVORY }}>Destacadas</b> aparecen en la galería
        principal del sitio público.
      </>
    ),
    tip: 'Ajusta el orden de las fotos para controlar cómo aparecen en el portafolio.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones · Tipo',
    title: 'Invitaciones Digitales — Paso 1: Tipo',
    body: (
      <>
        El wizard comienza eligiendo el tipo de invitación:
        <br /><br />
        <span style={{ color: GOLD }}>● General</span>{' '}
        <span style={{ color: DIM }}>(6 pasos)</span> — Un solo enlace compartido para todos los invitados.
        Sin RSVP individual. Ideal para eventos masivos o cuando no necesitas control de asistencia.
        <br /><br />
        <span style={{ color: GOLD }}>● Individual Personalizada</span>{' '}
        <span style={{ color: DIM }}>(7 pasos)</span> — Enlace único por invitado con seguimiento de
        RSVP. Cada persona o familia recibe su propio link con su nombre. Añade un paso extra de
        gestión de invitados.
      </>
    ),
    tip: 'Usa las pestañas Todas / General / Individual para filtrar el listado y ver confirmaciones en tiempo real.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones · Plantilla & Datos',
    title: 'Invitaciones — Pasos 2 y 3 (Individual: 3 y 4): Plantilla & Datos',
    body: (
      <>
        <b style={{ color: IVORY }}>Paso 2 — Plantilla:</b> Elige entre{' '}
        <span style={{ color: GOLD }}>10 diseños</span> (Cálida, Floral, Rústica, Moderno, Vintage,
        Perla, Esmeralda, Noir, Lavanda, Terracota) y el efecto de relieve:{' '}
        <span style={{ color: GOLD }}>Ninguno / Relieve / Lámina.</span>
        <br /><br />
        <b style={{ color: IVORY }}>Paso 3 — Datos del evento:</b>
        <br />
        <span style={{ color: DIM }}>· Título · Nombres del festejado · Tipo de evento</span>
        <br />
        <span style={{ color: DIM }}>· Fecha · Hora · Venue · Nota de ubicación</span>
        <br />
        <span style={{ color: DIM }}>· Foto principal (URL)</span>
        <br />
        <b style={{ color: IVORY }}>Ceremonia:</b>{' '}
        <span style={{ color: DIM }}>Lugar · Hora · Dirección · Foto (URL) · Google Maps</span>
        <br />
        <b style={{ color: IVORY }}>Recepción:</b>{' '}
        <span style={{ color: DIM }}>Lugar · Hora · Dirección · Foto (URL) · Google Maps</span>
        <br />
        <span style={{ color: DIM }}>· Cliente asignado (admin) · Nombre y email del propietario</span>
      </>
    ),
    tip: 'Solo Individual añade el Paso 3 de Invitados entre Plantilla y Datos — agrega personas o familias con su tamaño.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones · Contenido, Galería & Publicar',
    title: 'Invitaciones — Pasos 4, 5 y 6: Contenido, Galería y Publicar',
    body: (
      <>
        <b style={{ color: IVORY }}>Contenido:</b>
        <br />
        <span style={{ color: DIM }}>
          · Saludo al invitado · Nombre por defecto · Mensaje personal · Cita especial
          · Código de vestimenta · Hashtag · Papás (uno por línea) · Padrinos (uno por línea)
          · Regalos / Mesa de regalos · Instagram del evento
        </span>
        <br /><br />
        <b style={{ color: IVORY }}>Galería:</b>{' '}
        <span style={{ color: DIM }}>Sube hasta 8 fotos que se mostrarán dentro de la invitación.</span>
        <br /><br />
        <b style={{ color: IVORY }}>Publicar:</b>{' '}
        <span style={{ color: DIM }}>
          Etiqueta RSVP · Contacto RSVP (teléfono o URL) · Fecha límite de confirmación.
        </span>{' '}
        Activa el toggle <span style={{ color: GOLD }}>Publicar</span> para generar el enlace y
        código QR compartibles.
      </>
    ),
    tip: 'La invitación no es visible hasta que actives "Publicar". Puedes editarla cuantas veces necesites antes.',
  },
  {
    targetId: 'settings',
    sectionLabel: 'Configuración',
    title: 'Configuración del Sitio',
    body: (
      <>
        Actualiza teléfono, email, dirección, redes sociales y el texto del{' '}
        <b style={{ color: IVORY }}>Hero</b> del sitio público. Los cambios se reflejan
        de inmediato sin necesidad de redesplegar.
      </>
    ),
    tip: '¡Tutorial completo! Repítelo limpiando la clave "admin_tour_done" en localStorage.',
  },
]

export default function AdminTutorial() {
  return (
    <SpotlightTour
      tourKey="admin_tour_done"
      steps={STEPS}
      selectorAttr="data-tutorial"
      brandLabel="Pedro Vargas Fotografía · v1.1.2.9"
      onStepChange={() => {
        window.dispatchEvent(new CustomEvent('tutorial:open-sidebar'))
      }}
    />
  )
}
