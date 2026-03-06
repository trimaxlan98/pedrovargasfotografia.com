import heroPedro from '../assets/photos-web/hero-pedro.jpg'
import heroBoda from '../assets/photos-web/hero-boda.jpg'
import aboutPedro from '../assets/photos-web/about-pedro.jpg'

import portfolioBodasSesionCampo from '../assets/photos-web/portfolio-bodas-sesion-campo.jpg'
import portfolioBodaFiesta from '../assets/photos-web/portfolio-boda-fiesta.jpg'
import portfolioXvRetratoJardin from '../assets/photos-web/portfolio-xv-retrato-jardin.jpg'
import portfolioXvRamo from '../assets/photos-web/portfolio-xv-ramo.jpg'
import portfolioBodaCamioneta from '../assets/photos-web/portfolio-boda-camioneta.jpg'
import portfolioBodaFuente from '../assets/photos-web/portfolio-boda-fuente.jpg'
import portfolioXvVestidoNegro from '../assets/photos-web/portfolio-xv-vestido-negro.jpg'
import portfolioXvCeremonia from '../assets/photos-web/portfolio-xv-ceremonia.jpg'
import portfolioBodaPreparativos from '../assets/photos-web/portfolio-boda-preparativos.jpg'
import portfolioBodaBosque from '../assets/photos-web/portfolio-boda-bosque.jpg'
import portfolioXvVestidoRojo from '../assets/photos-web/portfolio-xv-vestido-rojo.jpg'
import portfolioBodaDetalles from '../assets/photos-web/portfolio-boda-detalles.jpg'

import eventBodaEntrada from '../assets/photos-web/evento-boda-entrada.jpg'
import eventBodaEmotivo from '../assets/photos-web/evento-boda-emotivo.jpg'
import eventBodaDecoracion from '../assets/photos-web/evento-boda-decoracion.jpg'
import eventXvBaileFamiliar from '../assets/photos-web/evento-xv-baile-familiar.jpg'
import eventXvSalon from '../assets/photos-web/evento-xv-salon.jpg'
import eventXvPreparativos from '../assets/photos-web/evento-xv-preparativos.jpg'

export const profilePhotos = {
  hero: {
    src: heroBoda,
    alt: 'Pareja de novios besándose con fuegos artificiales de fondo',
    position: '50% 0%',
  },
  about: {
    src: aboutPedro,
    alt: 'Pedro Vargas sentado con su cámara en estudio',
    position: '50% 34%',
  },
}

export type PortfolioAspect = 'portrait' | 'landscape' | 'square'

export interface PortfolioPhoto {
  id: number
  title: string
  type: 'Bodas' | 'Quince Años'
  filters: Array<'Eventos' | 'Sesiones' | 'Bodas' | 'Quince Años'>
  aspect: PortfolioAspect
  src: string
  alt: string
  position: string
}

export const portfolioFilters = ['Todos', 'Eventos', 'Sesiones', 'Bodas', 'Quince Años'] as const
export type PortfolioFilter = (typeof portfolioFilters)[number]

export const portfolioPhotos: PortfolioPhoto[] = [
  {
    id: 1,
    title: 'Sesión preboda en campo',
    type: 'Bodas',
    filters: ['Sesiones', 'Bodas'],
    aspect: 'landscape',
    src: portfolioBodasSesionCampo,
    alt: 'Pareja corriendo en una sesión de boda al aire libre',
    position: '50% 48%',
  },
  {
    id: 2,
    title: 'Entrada en pista de baile',
    type: 'Bodas',
    filters: ['Eventos', 'Bodas'],
    aspect: 'landscape',
    src: portfolioBodaFiesta,
    alt: 'Novios entrando a la pista durante su boda',
    position: '52% 40%',
  },
  {
    id: 3,
    title: 'Retrato quinceañera en jardín',
    type: 'Quince Años',
    filters: ['Sesiones', 'Quince Años'],
    aspect: 'portrait',
    src: portfolioXvRetratoJardin,
    alt: 'Retrato de quinceañera en jardín',
    position: '50% 28%',
  },
  {
    id: 4,
    title: 'Ramo rojo al atardecer',
    type: 'Quince Años',
    filters: ['Eventos', 'Quince Años'],
    aspect: 'portrait',
    src: portfolioXvRamo,
    alt: 'Quinceañera con ramo rojo en retrato vertical',
    position: '50% 30%',
  },
  {
    id: 5,
    title: 'Beso en camioneta clásica',
    type: 'Bodas',
    filters: ['Sesiones', 'Bodas'],
    aspect: 'portrait',
    src: portfolioBodaCamioneta,
    alt: 'Pareja besándose en camioneta clásica',
    position: '40% 52%',
  },
  {
    id: 6,
    title: 'Sesión en fuente monumental',
    type: 'Bodas',
    filters: ['Sesiones', 'Bodas'],
    aspect: 'landscape',
    src: portfolioBodaFuente,
    alt: 'Novio cargando a la novia frente a una fuente',
    position: '50% 54%',
  },
  {
    id: 7,
    title: 'Editorial vestido negro',
    type: 'Quince Años',
    filters: ['Sesiones', 'Quince Años'],
    aspect: 'landscape',
    src: portfolioXvVestidoNegro,
    alt: 'Quinceañera en vestido negro en interior de piedra',
    position: '50% 48%',
  },
  {
    id: 8,
    title: 'Ceremonia en iglesia',
    type: 'Quince Años',
    filters: ['Eventos', 'Quince Años'],
    aspect: 'square',
    src: portfolioXvCeremonia,
    alt: 'Ceremonia de quince años en iglesia',
    position: '50% 50%',
  },
  {
    id: 9,
    title: 'Preparativos con damas',
    type: 'Bodas',
    filters: ['Eventos', 'Bodas'],
    aspect: 'landscape',
    src: portfolioBodaPreparativos,
    alt: 'Novia durante preparativos con sus damas',
    position: '50% 45%',
  },
  {
    id: 10,
    title: 'Retrato en bosque',
    type: 'Bodas',
    filters: ['Sesiones', 'Bodas'],
    aspect: 'portrait',
    src: portfolioBodaBosque,
    alt: 'Pareja en retrato vertical dentro del bosque',
    position: '50% 32%',
  },
  {
    id: 11,
    title: 'Vestido rojo en hacienda',
    type: 'Quince Años',
    filters: ['Sesiones', 'Quince Años'],
    aspect: 'landscape',
    src: portfolioXvVestidoRojo,
    alt: 'Quinceañera con vestido rojo en hacienda',
    position: '50% 42%',
  },
  {
    id: 12,
    title: 'Detalle del novio',
    type: 'Bodas',
    filters: ['Eventos', 'Bodas'],
    aspect: 'square',
    src: portfolioBodaDetalles,
    alt: 'Detalle del novio alistándose antes de la boda',
    position: '50% 35%',
  },
]

export interface EventCard {
  year: string
  title: string
  venue: string
  type: 'Bodas' | 'Quince Años'
  description: string
  src: string
  alt: string
  position: string
}

export const eventsData: EventCard[] = [
  {
    year: '2025',
    title: 'Entrada de Novios',
    venue: 'Salón de Eventos',
    type: 'Bodas',
    description: 'Cobertura de alto dinamismo en pista, con luz de escenario y enfoque en expresión.',
    src: eventBodaEntrada,
    alt: 'Novios entrando a la pista junto a invitados',
    position: '50% 44%',
  },
  {
    year: '2025',
    title: 'Momento Emotivo',
    venue: 'Jardín Privado',
    type: 'Bodas',
    description: 'Fotografía documental enfocada en abrazos y reacciones auténticas de familia cercana.',
    src: eventBodaEmotivo,
    alt: 'Abrazo emotivo durante boda al aire libre',
    position: '52% 45%',
  },
  {
    year: '2024',
    title: 'Diseño y Detalle',
    venue: 'Recepción Nocturna',
    type: 'Bodas',
    description: 'Captura editorial de decoración, mesa y ambientación para narrar el evento completo.',
    src: eventBodaDecoracion,
    alt: 'Detalle de mesa decorada para boda',
    position: '50% 58%',
  },
  {
    year: '2025',
    title: 'Vals Familiar',
    venue: 'Salón Versalles',
    type: 'Quince Años',
    description: 'Secuencia del primer baile con enfoque en movimiento, vestuario y conexión familiar.',
    src: eventXvBaileFamiliar,
    alt: 'Baile de quinceañera con familiar en pista',
    position: '50% 50%',
  },
  {
    year: '2024',
    title: 'Escenografía de Salón',
    venue: 'Evento Temático',
    type: 'Quince Años',
    description: 'Composición amplia para mostrar arquitectura del lugar, color y montaje principal.',
    src: eventXvSalon,
    alt: 'Quinceañera en salón decorado con telas rojas',
    position: '50% 43%',
  },
  {
    year: '2024',
    title: 'Backstage de Preparación',
    venue: 'Casa de la Festejada',
    type: 'Quince Años',
    description: 'Registro previo a ceremonia: maquillaje, estilismo y retratos espontáneos.',
    src: eventXvPreparativos,
    alt: 'Quinceañera en preparativos con estilista',
    position: '52% 40%',
  },
]
