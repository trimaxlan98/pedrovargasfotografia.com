import SpotlightTour, { TourStep } from '../SpotlightTour'

const GOLD  = '#C9A96E'
const IVORY = '#F5F0E8'
const DIM   = 'rgba(245,240,232,0.55)'

const STEPS: TourStep[] = [
  {
    targetId: null,
    sectionLabel: 'Inicio',
    title: 'Bienvenido a tu Portal',
    body: (
      <>
        Desde aquí gestionas tus <b style={{ color: IVORY }}>reservas</b> e{' '}
        <b style={{ color: IVORY }}>invitaciones digitales</b> personalizadas.
        Este tour de <b style={{ color: IVORY }}>6 pasos</b> te guía por cada sección.
      </>
    ),
  },
  {
    targetId: 'bookings',
    sectionLabel: 'Mis Reservas',
    title: 'Mis Reservas',
    placement: 'below',
    body: (
      <>
        Consulta el estado de tus reservas activas:{' '}
        <span style={{ color: GOLD }}>Pendiente → Confirmado → Depósito pagado → En progreso → Completado.</span>
        {' '}Usa el botón <b style={{ color: IVORY }}>Nueva reserva</b> para solicitar
        una sesión o cobertura de evento.
      </>
    ),
    tip: 'Puedes cancelar una reserva siempre que esté en estado Pendiente o Confirmado.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones · Tipo',
    title: 'Mis Invitaciones — Paso 1: Tipo',
    placement: 'below',
    body: (
      <>
        El asistente comienza eligiendo el tipo:
        <br /><br />
        <span style={{ color: GOLD }}>● General</span>{' '}
        <span style={{ color: DIM }}>(6 pasos)</span> — Un enlace único para todos.
        Sin control de asistencia individual. Perfecto para anunciar el evento a grupos grandes.
        <br /><br />
        <span style={{ color: GOLD }}>● Individual Personalizada</span>{' '}
        <span style={{ color: DIM }}>(7 pasos)</span> — Enlace propio por invitado con RSVP.
        Podrás ver quién confirmó, quién declinó y quién no ha respondido.
      </>
    ),
    tip: 'Con tipo Individual se agrega el paso "Invitados" donde añades personas sueltas o familias con su tamaño.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones · Plantilla & Datos',
    title: 'Mis Invitaciones — Pasos 2 y 3: Plantilla & Datos del Evento',
    placement: 'below',
    body: (
      <>
        <b style={{ color: IVORY }}>Paso 2 — Plantilla:</b> Elige entre{' '}
        <span style={{ color: GOLD }}>10 diseños</span> (Cálida, Floral, Rústica, Moderno,
        Vintage, Perla, Esmeralda, Noir, Lavanda, Terracota) y el efecto:{' '}
        <span style={{ color: GOLD }}>Ninguno / Relieve / Lámina.</span>
        <br /><br />
        <b style={{ color: IVORY }}>Paso 3 — Datos del evento:</b>
        <br />
        <span style={{ color: DIM }}>· Título de la invitación</span>
        <br />
        <span style={{ color: DIM }}>· Nombres del festejado (ej. "Ana & Carlos")</span>
        <br />
        <span style={{ color: DIM }}>· Tipo de evento (Boda, XV, Cumpleaños…)</span>
        <br />
        <span style={{ color: DIM }}>· Fecha · Hora · Venue · Nota de ubicación (Ciudad, País)</span>
        <br />
        <span style={{ color: DIM }}>· Foto principal (URL de imagen)</span>
        <br /><br />
        <b style={{ color: IVORY }}>Ceremonia y Recepción</b> (opcional cada una):
        <br />
        <span style={{ color: DIM }}>Lugar · Hora · Dirección · Foto (URL) · Enlace Google Maps</span>
      </>
    ),
    tip: 'Puedes dejar Ceremonia o Recepción vacías si tu evento solo tiene uno de los dos momentos.',
  },
  {
    targetId: 'invitations',
    sectionLabel: 'Invitaciones · Contenido, Galería & Publicar',
    title: 'Mis Invitaciones — Pasos 4, 5 y 6: Contenido, Galería y Publicar',
    placement: 'below',
    body: (
      <>
        <b style={{ color: IVORY }}>Paso 4 — Contenido:</b>
        <br />
        <span style={{ color: DIM }}>
          · Saludo al invitado (ej. "Estimado", "Querida")
          · Nombre por defecto si no hay nombre individual
          · Mensaje personal · Cita o frase especial · Código de vestimenta · Hashtag
          · Papás (uno por línea) · Padrinos (uno por línea)
          · Info de regalos / Mesa de regalos · Instagram del evento (@usuario)
        </span>
        <br /><br />
        <b style={{ color: IVORY }}>Paso 5 — Galería:</b>{' '}
        <span style={{ color: DIM }}>
          Sube hasta 8 fotos. También puedes agregar{' '}
          <b style={{ color: IVORY }}>música de fondo</b> (MP3 / M4A — máx. 15 MB)
          que sonará al abrir la invitación.
        </span>
        <br /><br />
        <b style={{ color: IVORY }}>Paso 6 — Publicar:</b>
        <br />
        <span style={{ color: DIM }}>
          · Etiqueta del botón RSVP · Contacto RSVP (teléfono o link)
          · Fecha límite para confirmar asistencia
        </span>
        <br />
        Activa <span style={{ color: GOLD }}>Publicar</span> para generar tu enlace y QR.
        El toggle <span style={{ color: GOLD }}>Número de mesa</span> muestra la mesa
        asignada en invitaciones individuales. Nadie ve la invitación hasta que actives Publicar.
      </>
    ),
    tip: 'Puedes editar cualquier dato después de publicar — el enlace permanece igual.',
  },
  {
    targetId: 'history',
    sectionLabel: 'Historial',
    title: 'Historial',
    placement: 'below',
    body: (
      <>
        Aquí encuentras el registro completo de tus reservas e invitaciones archivadas
        de eventos pasados. Los elementos archivados{' '}
        <b style={{ color: IVORY }}>no se eliminan</b> — siempre podrás consultarlos
        como referencia o para reutilizar información en nuevas invitaciones.
      </>
    ),
    tip: '¡Tour completo! Ya conoces todas las secciones de tu portal.',
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
