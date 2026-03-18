import portfolioBodaCamioneta from '../../assets/photos-web/portfolio-boda-camioneta.jpg'
import portfolioBodasSesionCampo from '../../assets/photos-web/portfolio-bodas-sesion-campo.jpg'
import portfolioBodaFuente from '../../assets/photos-web/portfolio-boda-fuente.jpg'
import portfolioBodaBosque from '../../assets/photos-web/portfolio-boda-bosque.jpg'

import portfolioXvRetratoJardin from '../../assets/photos-web/portfolio-xv-retrato-jardin.jpg'
import portfolioXvRamo from '../../assets/photos-web/portfolio-xv-ramo.jpg'
import portfolioXvVestidoRojo from '../../assets/photos-web/portfolio-xv-vestido-rojo.jpg'
import portfolioXvVestidoNegro from '../../assets/photos-web/portfolio-xv-vestido-negro.jpg'

import portfolioBodaDetalles from '../../assets/photos-web/portfolio-boda-detalles.jpg'
import portfolioBodaPreparativos from '../../assets/photos-web/portfolio-boda-preparativos.jpg'
import eventBodaDecoracion from '../../assets/photos-web/evento-boda-decoracion.jpg'
import eventBodaEmotivo from '../../assets/photos-web/evento-boda-emotivo.jpg'

import eventBodaEntrada from '../../assets/photos-web/evento-boda-entrada.jpg'
import eventXvSalon from '../../assets/photos-web/evento-xv-salon.jpg'
import eventXvBaileFamiliar from '../../assets/photos-web/evento-xv-baile-familiar.jpg'
import eventXvPreparativos from '../../assets/photos-web/evento-xv-preparativos.jpg'

export type InvitationTemplate =
  | 'warm' | 'floral' | 'rustic' | 'moderno'
  | 'vintage' | 'pearl' | 'esmeralda' | 'noir' | 'lavanda' | 'terracota'
  | 'custom'

export interface ApiInvitationGuestStats {
  total: number
  confirmed: number
  pending: number
  declined: number
}

export interface ApiInvitation {
  id: string
  invitationType?: 'general' | 'individual'
  clientId?: string
  eventType: string
  title: string
  names: string
  eventDate: string
  eventTime?: string
  venue?: string
  locationNote?: string
  message?: string
  quote?: string
  hashtag?: string
  template: InvitationTemplate | string
  primaryColor?: string
  textColor?: string
  fontStyle?: string
  isDark?: boolean
  dressCode?: string
  rsvpLabel?: string
  rsvpValue?: string
  heroImage?: string
  gallery?: string[]
  shareToken: string
  views: number
  isPublished: boolean
  archivedAt?: string | null
  archiveReason?: string | null
  guestGreeting?: string
  defaultGuestName?: string
  guestStats?: ApiInvitationGuestStats
  rsvpDeadline?: string | null
  createdAt: string
  client?: { id: string; name: string; email: string }

  // Sección Ceremonia
  ceremonyVenue?: string
  ceremonyAddress?: string
  ceremonyTime?: string
  ceremonyPhoto?: string
  ceremonyMapUrl?: string

  // Sección Recepción
  receptionVenue?: string
  receptionAddress?: string
  receptionTime?: string
  receptionPhoto?: string
  receptionMapUrl?: string

  // Secciones adicionales
  parentsInfo?: string
  sponsorsInfo?: string
  giftsInfo?: string
  instagramHandle?: string

  // Número de mesa
  enableTableNumber?: boolean

  // Música de fondo
  backgroundMusic?: string | null

  // Plantilla personalizada
  customTemplate?: string | null
  // Múltiples páginas de plantilla (una por sección del scroll)
  customTemplatePages?: string[] | null
}

export interface ApiInvitationGuest {
  id: string
  invitationId: string
  name: string
  token: string
  response: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  personalizedMessage?: string
  tableNumber?: number | null
  respondedAt?: string | null
  createdAt: string
}

export const DEMO_GALLERY_BY_TEMPLATE: Record<InvitationTemplate, string[]> = {
  warm: [
    portfolioBodaCamioneta,
    portfolioBodasSesionCampo,
    portfolioBodaFuente,
    portfolioBodaBosque,
  ],
  floral: [
    portfolioXvRetratoJardin,
    portfolioXvRamo,
    portfolioXvVestidoRojo,
    portfolioXvVestidoNegro,
  ],
  rustic: [
    portfolioBodaDetalles,
    portfolioBodaPreparativos,
    eventBodaDecoracion,
    eventBodaEmotivo,
  ],
  moderno: [
    eventBodaEntrada,
    eventXvSalon,
    eventXvBaileFamiliar,
    eventXvPreparativos,
  ],
  vintage: [
    portfolioBodaFuente,
    portfolioBodaDetalles,
    eventBodaDecoracion,
    portfolioBodaBosque,
  ],
  pearl: [
    portfolioXvVestidoRojo,
    portfolioXvRetratoJardin,
    eventXvSalon,
    portfolioXvVestidoNegro,
  ],
  esmeralda: [
    portfolioBodaBosque,
    portfolioBodasSesionCampo,
    eventBodaEmotivo,
    portfolioBodaFuente,
  ],
  noir: [
    eventBodaEntrada,
    portfolioBodaDetalles,
    portfolioBodaCamioneta,
    eventBodaEmotivo,
  ],
  lavanda: [
    portfolioXvVestidoRojo,
    portfolioXvRamo,
    eventXvBaileFamiliar,
    portfolioXvRetratoJardin,
  ],
  terracota: [
    portfolioBodaCamioneta,
    eventBodaDecoracion,
    portfolioBodasSesionCampo,
    portfolioBodaPreparativos,
  ],
  custom: [],
}

export function getDemoGalleryForTemplate(template?: string): string[] {
  if (!template) return DEMO_GALLERY_BY_TEMPLATE.warm
  return DEMO_GALLERY_BY_TEMPLATE[template as InvitationTemplate] ?? DEMO_GALLERY_BY_TEMPLATE.warm
}

const API_URL = import.meta.env.VITE_API_URL || '/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function resolveInvitationImageUrl(url?: string): string {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`
  if (url.startsWith('uploads/')) return `${API_ORIGIN}/${url}`
  return url
}

const demoTemplate: InvitationTemplate = 'floral'

export const demoInvitation: ApiInvitation = {
  id: 'demo',
  eventType: 'XV Años',
  title: 'Mis Quince Años',
  names: 'Sofía Valentina',
  eventDate: '28 junio 2026',
  eventTime: '18:00',
  venue: 'Jardín Magnolia',
  locationNote: 'Querétaro, México',
  message: 'Con el corazón lleno de alegría, quiero compartir este momento tan especial contigo.',
  quote: 'El amor y la alegría de vivir no tienen edad.',
  hashtag: '#XVSofiaValentina',
  template: demoTemplate,
  primaryColor: '#b5607a',
  textColor: '#3a1422',
  dressCode: 'Formal · Tonos pastel o blancos',
  rsvpLabel: 'Confirmar asistencia',
  rsvpValue: 'WhatsApp: +52 555 123 4567',
  heroImage: portfolioXvRetratoJardin,
  gallery: getDemoGalleryForTemplate(demoTemplate),
  shareToken: 'demo',
  views: 0,
  isPublished: true,
  createdAt: new Date().toISOString(),
  guestGreeting: 'Con todo mi cariño te invito',
  defaultGuestName: 'Familia y Amigos',

  // Ceremony
  ceremonyVenue: 'Parroquia San Francisco de Asís',
  ceremonyAddress: 'Av. Tecnológico 100, Santiago de Querétaro',
  ceremonyTime: '17:00 hrs',
  ceremonyPhoto: portfolioBodasSesionCampo,
  ceremonyMapUrl: 'https://www.google.com/maps/search/?api=1&query=Parroquia+San+Francisco+Queretaro',

  // Reception
  receptionVenue: 'Jardín Magnolia',
  receptionAddress: 'Blvd. Bernardo Quintana 500, Querétaro',
  receptionTime: '19:00 hrs',
  receptionPhoto: eventXvSalon,
  receptionMapUrl: 'https://www.google.com/maps/search/?api=1&query=Jardin+Magnolia+Queretaro',

  // Additional sections
  parentsInfo: JSON.stringify(['Lic. Carlos Hernández & Dra. Mariana López']),
  sponsorsInfo: JSON.stringify(['Ing. Roberto Vargas & Sra. Patricia Ruiz', 'Sr. Alejandro Méndez & Sra. Claudia Torres']),
  giftsInfo: 'Mesa de regalos Liverpool — Evento: 12345678\nTienda Liverpool Galerías Querétaro',
  instagramHandle: '@sofiavalentina_xv',
}
