import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const ROOT_DIR = path.resolve(__dirname, '..', '..')

const SAMPLE_PORTFOLIO_IMAGES = [
  { name: 'sample1.jpg', source: path.resolve(ROOT_DIR, 'src/assets/photos-web/portfolio-boda-bosque.jpg') },
  { name: 'sample2.jpg', source: path.resolve(ROOT_DIR, 'src/assets/photos-web/portfolio-boda-fuente.jpg') },
  { name: 'sample3.jpg', source: path.resolve(ROOT_DIR, 'src/assets/photos-web/portfolio-boda-fiesta.jpg') },
  { name: 'sample4.jpg', source: path.resolve(ROOT_DIR, 'src/assets/photos-web/portfolio-boda-preparativos.jpg') },
  { name: 'sample5.jpg', source: path.resolve(ROOT_DIR, 'src/assets/photos-web/portfolio-xv-retrato-jardin.jpg') },
  { name: 'sample6.jpg', source: path.resolve(ROOT_DIR, 'src/assets/photos-web/portfolio-xv-vestido-rojo.jpg') },
]

function ensureSamplePortfolioUploads(): string[] {
  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  return SAMPLE_PORTFOLIO_IMAGES.map(({ name, source }) => {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(uploadDir, name))
    }
    return `/uploads/${name}`
  })
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ──────────────── Admin ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@studiolumiere.mx'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
  const adminName = process.env.ADMIN_NAME || 'Miguel Ángel Lumière'

  const hashedAdmin = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdmin,
      name: adminName,
      role: 'ADMIN',
      phone: '+52 55 1234 5678',
    },
  })
  console.log(`✅ Admin creado: ${admin.email}`)

  // ──────────────── Cliente de prueba ──────────────────────────────────────────────
  const clientPassword = await bcrypt.hash('Cliente123!', 12)
  const client = await prisma.user.upsert({
    where: { email: 'cliente@ejemplo.mx' },
    update: {},
    create: {
      email: 'cliente@ejemplo.mx',
      password: clientPassword,
      name: 'María González',
      role: 'CLIENT',
      phone: '+52 55 9876 5432',
    },
  })
  console.log(`✅ Cliente de prueba creado: ${client.email}`)

  // ──────────────── Testimonios ──────────────────────────────────────────────────────
  const testimonials = [
    { clientName: 'Sofía y Rodrigo', eventType: 'Boda', text: 'Miguel capturó cada momento de nuestra boda con una magia increíble. Las fotos superaron todas nuestras expectativas.', rating: 5, featured: true },
    { clientName: 'Empresa TechMex', eventType: 'Corporativo', text: 'Profesionalismo y creatividad impecables. Nuestro evento anual quedó inmortalizado de manera excepcional.', rating: 5, featured: true },
    { clientName: 'Isabella Morales', eventType: 'XV Años', text: 'Mis quince años quedaron perfectos gracias a Studio Lumière. Cada foto cuenta una historia.', rating: 5, featured: false },
    { clientName: 'Carlos y Ana', eventType: 'Boda', text: 'No podríamos haber elegido mejor fotógrafo para nuestra boda. Gracias por hacer eterno nuestro día especial.', rating: 5, featured: true },
    { clientName: 'Valentina Ríos', eventType: 'Graduación', text: 'Las fotos de mi graduación son simplemente espectaculares. Capturó exactamente lo que yo quería.', rating: 5, featured: false },
    { clientName: 'Grupo Empresarial Norte', eventType: 'Corporativo', text: 'Altamente recomendado para eventos corporativos. Discreción, calidad y puntualidad garantizados.', rating: 5, featured: false },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }
  console.log(`✅ ${testimonials.length} testimonios creados`)

  // ──────────────── Servicios ────────────────────────────────────────────────────────
  const services = [
    {
      title: 'Bodas & Celebraciones',
      description: 'Cada detalle de tu día especial inmortalizado con arte y emoción.',
      price: 'Desde $15,000 MXN',
      features: JSON.stringify(['Cobertura completa del evento', 'Álbum digital premium', 'Edición profesional', 'Entrega en 4 semanas']),
      iconName: 'Heart',
      order: 1,
    },
    {
      title: 'Eventos Corporativos',
      description: 'Imagen profesional que refleja la esencia de tu empresa.',
      price: 'Desde $8,000 MXN',
      features: JSON.stringify(['Fotografía de presentaciones', 'Retratos ejecutivos', 'Eventos y conferencias', 'Licencia comercial']),
      iconName: 'Briefcase',
      order: 2,
    },
    {
      title: 'Retratos & Sesiones',
      description: 'Tu personalidad capturada en imágenes que cuentan tu historia.',
      price: 'Desde $3,500 MXN',
      features: JSON.stringify(['Sesión de 2 horas', '30 fotos editadas', 'Múltiples looks', 'Galería privada online']),
      iconName: 'User',
      order: 3,
    },
    {
      title: 'XV Años & Graduaciones',
      description: 'Hitos de vida que merecen ser recordados para siempre.',
      price: 'Desde $12,000 MXN',
      features: JSON.stringify(['Cobertura del evento', 'Sesión previa incluida', 'Video highlight', 'Álbum impreso']),
      iconName: 'Star',
      order: 4,
    },
    {
      title: 'Fotografía Editorial',
      description: 'Imágenes con narrativa visual para marcas y publicaciones.',
      price: 'Desde $10,000 MXN',
      features: JSON.stringify(['Concepto creativo', 'Dirección de arte', 'Post-producción avanzada', 'Derechos de uso']),
      iconName: 'Camera',
      order: 5,
    },
    {
      title: 'Video + Foto Combo',
      description: 'El paquete completo para preservar cada momento en imagen y movimiento.',
      price: 'Desde $20,000 MXN',
      features: JSON.stringify(['Foto y video profesional', 'Highlight cinematográfico', 'Drone opcional', 'Disco duro incluido']),
      iconName: 'Video',
      order: 6,
    },
  ]

  for (const s of services) {
    await prisma.service.create({ data: s })
  }
  console.log(`✅ ${services.length} servicios creados`)

  // ──────────────── Portfolio de muestra ──────────────────────────────────────────────
  const sampleImageUrls = ensureSamplePortfolioUploads()
  const portfolioItems = [
    { title: 'Boda en Hacienda', category: 'Bodas', imageUrl: sampleImageUrls[0], description: 'Una boda mágica en las afueras de CDMX', eventDate: '2024-06-15', location: 'Hacienda San Miguel, CDMX', featured: true },
    { title: 'Congreso Anual TechMex', category: 'Corporativo', imageUrl: sampleImageUrls[1], description: 'Cobertura completa del congreso tecnológico', eventDate: '2024-03-20', location: 'Camino Real, CDMX', featured: false },
    { title: 'XV Años Isabella', category: 'Quince Años', imageUrl: sampleImageUrls[2], description: 'Una noche mágica de quinceañera', eventDate: '2024-04-28', location: 'Salón Versalles, CDMX', featured: true },
    { title: 'Graduación UNAM 2024', category: 'Graduaciones', imageUrl: sampleImageUrls[3], description: 'Generación 2024 Universidad Nacional', eventDate: '2024-07-10', location: 'UNAM, Ciudad de México', featured: false },
    { title: 'Sesión Editorial Vogue', category: 'Social', imageUrl: sampleImageUrls[4], description: 'Editorial de moda primavera-verano', eventDate: '2024-02-14', location: 'Estudio Lumière, CDMX', featured: true },
    { title: 'Boda en Playa', category: 'Bodas', imageUrl: sampleImageUrls[5], description: 'Ceremonia romántica frente al mar', eventDate: '2023-12-31', location: 'Los Cabos, BCS', featured: false },
  ]

  for (const p of portfolioItems) {
    await prisma.portfolioItem.create({ data: p })
  }
  console.log(`✅ ${portfolioItems.length} items de portfolio creados`)

  // ──────────────── Configuración del sitio ───────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      phone: '+52 55 1234 5678',
      email: 'hola@studiolumiere.mx',
      address: 'Ciudad de México, CDMX',
      instagram: 'https://instagram.com/studiolumiere',
      whatsapp: '+5255123455678',
      heroTitle: 'Cada Momento Contado en Luz',
      heroSubtitle: 'Fotografía profesional para tus momentos más importantes',
    },
  })
  console.log('✅ Configuración del sitio creada')

  // ──────────────── Solicitud de contacto de muestra ─────────────────────────────────
  await prisma.contactRequest.create({
    data: {
      name: 'Laura Martínez',
      email: 'laura@ejemplo.com',
      phone: '+52 55 4567 8901',
      eventDate: '2025-02-14',
      service: 'Bodas & Celebraciones',
      message: 'Hola, me interesa cotizar fotografía para mi boda en febrero. Somos alrededor de 150 invitados.',
      status: 'PENDING',
    },
  })
  console.log('✅ Solicitud de contacto de muestra creada')

  console.log('\n🎉 Seed completado exitosamente!')
  console.log(`\n📧 Admin: ${adminEmail}`)
  console.log(`🔑 Contraseña: ${adminPassword}`)
  console.log('📧 Cliente demo: cliente@ejemplo.mx')
  console.log('🔑 Contraseña: Cliente123!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
