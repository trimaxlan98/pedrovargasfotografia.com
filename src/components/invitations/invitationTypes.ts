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
}

export interface ApiInvitationGuest {
  id: string
  invitationId: string
  name: string
  token: string
  response: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  personalizedMessage?: string
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
}

export function getDemoGalleryForTemplate(template?: string): string[] {
  if (!template) return DEMO_GALLERY_BY_TEMPLATE.warm
  return DEMO_GALLERY_BY_TEMPLATE[template as InvitationTemplate] ?? DEMO_GALLERY_BY_TEMPLATE.warm
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
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

const demoTemplate: InvitationTemplate = 'rustic'

export const demoInvitation: ApiInvitation = {
  id: 'demo',
  eventType: 'Boda',
  title: 'Estás invitado a nuestra boda',
  names: 'Elizabeth & Salomón',
  eventDate: '12 junio 2026',
  eventTime: '18:00',
  venue: 'Hacienda San Rafael',
  locationNote: 'Querétaro, México',
  message: 'El amor contigo es un viaje sin fin, y cada día es una nueva aventura.',
  quote: 'Amar es encontrar en la felicidad de otro tu propia felicidad.',
  hashtag: '#BodaElizabethSalomon',
  template: demoTemplate,
  primaryColor: '#b07b4b',
  textColor: '#2b1a10',
  dressCode: 'Etiqueta formal, tonos claros',
  rsvpLabel: 'Confirmar asistencia',
  rsvpValue: 'WhatsApp: +52 555 123 4567',
  heroImage: portfolioBodasSesionCampo,
  gallery: getDemoGalleryForTemplate(demoTemplate),
  shareToken: 'demo',
  views: 0,
  isPublished: true,
  createdAt: new Date().toISOString(),
}
