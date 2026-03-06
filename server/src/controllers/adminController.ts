import { Response } from 'express'
import prisma from '../utils/prisma'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '../utils/password'
import { AuthRequest } from '../types'
import * as R from '../utils/response'

function parseGallery(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeInvitation(invitation: any) {
  return {
    ...invitation,
    gallery: parseGallery(invitation.gallery),
  }
}

function serializeGallery(input: unknown): string | undefined {
  if (!input) return undefined
  if (Array.isArray(input)) return JSON.stringify(input)
  if (typeof input === 'string') return input
  return undefined
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────

export async function getDashboard(_req: AuthRequest, res: Response): Promise<void> {
  const [
    totalContacts,
    pendingContacts,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    totalClients,
    totalPortfolio,
    recentContacts,
    recentBookings,
  ] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.contactRequest.count({ where: { status: 'PENDING' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.portfolioItem.count(),
    prisma.contactRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { name: true, email: true } } },
    }),
  ])

  R.success(res, {
    stats: { totalContacts, pendingContacts, totalBookings, pendingBookings, confirmedBookings, totalClients, totalPortfolio },
    recentContacts,
    recentBookings,
  })
}

// ─── SOLICITUDES DE CONTACTO ───────────────────────────────────────────────────

export async function listContacts(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit
  const status = req.query.status as string | undefined
  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const [contacts, total] = await Promise.all([
    prisma.contactRequest.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.contactRequest.count({ where }),
  ])
  R.paginate(res, contacts, total, page, limit)
}

export async function getContact(req: AuthRequest, res: Response): Promise<void> {
  const contact = await prisma.contactRequest.findUnique({ where: { id: req.params.id } })
  if (!contact) { R.notFound(res); return }
  R.success(res, contact)
}

export async function updateContact(req: AuthRequest, res: Response): Promise<void> {
  const { status, notes } = req.body
  const contact = await prisma.contactRequest.update({
    where: { id: req.params.id },
    data: { status, notes },
  })
  R.success(res, contact, 'Solicitud actualizada')
}

export async function deleteContact(req: AuthRequest, res: Response): Promise<void> {
  await prisma.contactRequest.delete({ where: { id: req.params.id } })
  R.noContent(res)
}

// ─── RESERVAS ──────────────────────────────────────────────────────────────────

export async function listBookings(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit
  const status = req.query.status as string | undefined
  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { id: true, name: true, email: true, phone: true } } },
    }),
    prisma.booking.count({ where }),
  ])
  R.paginate(res, bookings, total, page, limit)
}

export async function getBooking(req: AuthRequest, res: Response): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { id: true, name: true, email: true, phone: true } } },
  })
  if (!booking) { R.notFound(res); return }
  R.success(res, booking)
}

export async function updateBooking(req: AuthRequest, res: Response): Promise<void> {
  const { status, adminNotes, totalPrice, depositPaid } = req.body
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status, adminNotes, totalPrice, depositPaid },
  })
  R.success(res, booking, 'Reserva actualizada')
}

// ─── PORTFOLIO ─────────────────────────────────────────────────────────────────

export async function listPortfolio(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Number(req.query.limit) || 20)
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.portfolioItem.findMany({ skip, take: limit, orderBy: { order: 'asc' } }),
    prisma.portfolioItem.count(),
  ])
  R.paginate(res, items, total, page, limit)
}

export async function createPortfolioItem(req: AuthRequest, res: Response): Promise<void> {
  const { title, category, description, eventDate, location, featured, order } = req.body
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl

  if (!imageUrl) { R.badRequest(res, 'La imagen es requerida'); return }

  const item = await prisma.portfolioItem.create({
    data: { title, category, imageUrl, description, eventDate, location, featured: featured === 'true', order: Number(order) || 0 },
  })
  R.created(res, item, 'Item de portfolio creado')
}

export async function updatePortfolioItem(req: AuthRequest, res: Response): Promise<void> {
  const { title, category, description, eventDate, location, featured, order, isVisible } = req.body
  const data: Record<string, unknown> = { title, category, description, eventDate, location }
  if (featured !== undefined) data.featured = featured === 'true' || featured === true
  if (isVisible !== undefined) data.isVisible = isVisible === 'true' || isVisible === true
  if (order !== undefined) data.order = Number(order)
  if (req.file) data.imageUrl = `/uploads/${req.file.filename}`

  const item = await prisma.portfolioItem.update({ where: { id: req.params.id }, data })
  R.success(res, item, 'Item actualizado')
}

export async function deletePortfolioItem(req: AuthRequest, res: Response): Promise<void> {
  await prisma.portfolioItem.delete({ where: { id: req.params.id } })
  R.noContent(res)
}

// ─── TESTIMONIOS ───────────────────────────────────────────────────────────────

export async function listTestimonials(_req: AuthRequest, res: Response): Promise<void> {
  const items = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
  R.success(res, items)
}

export async function createTestimonial(req: AuthRequest, res: Response): Promise<void> {
  const item = await prisma.testimonial.create({ data: req.body })
  R.created(res, item)
}

export async function updateTestimonial(req: AuthRequest, res: Response): Promise<void> {
  const item = await prisma.testimonial.update({ where: { id: req.params.id }, data: req.body })
  R.success(res, item, 'Testimonio actualizado')
}

export async function deleteTestimonial(req: AuthRequest, res: Response): Promise<void> {
  await prisma.testimonial.delete({ where: { id: req.params.id } })
  R.noContent(res)
}

// ─── SERVICIOS ─────────────────────────────────────────────────────────────────

export async function listServices(_req: AuthRequest, res: Response): Promise<void> {
  const items = await prisma.service.findMany({ orderBy: { order: 'asc' } })
  R.success(res, items)
}

export async function updateService(req: AuthRequest, res: Response): Promise<void> {
  const { features, ...rest } = req.body
  const data: Record<string, unknown> = { ...rest }
  if (features) data.features = Array.isArray(features) ? JSON.stringify(features) : features

  const item = await prisma.service.update({ where: { id: req.params.id }, data })
  R.success(res, { ...item, features: JSON.parse(item.features || '[]') }, 'Servicio actualizado')
}

// ─── CLIENTES ──────────────────────────────────────────────────────────────────

export async function listClients(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit
  const search = req.query.search as string | undefined
  const where: Record<string, unknown> = { role: 'CLIENT' }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])
  R.paginate(res, clients, total, page, limit)
}

export async function createClient(req: AuthRequest, res: Response): Promise<void> {
  const { name, email, phone, password } = req.body
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) { R.conflict(res, 'Ya existe una cuenta con ese correo'); return }

  const hashed = await hashPassword(password || 'Cliente123!')
  const client = await prisma.user.create({
    data: { name, email, phone, password: hashed, role: 'CLIENT' },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })
  R.created(res, client, 'Cliente creado exitosamente')
}

export async function toggleClientStatus(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) { R.notFound(res); return }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  })
  R.success(res, updated, `Cliente ${updated.isActive ? 'activado' : 'desactivado'}`)
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

// Invitaciones digitales

export async function listInvitations(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.digitalInvitation.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { id: true, name: true, email: true } } },
    }),
    prisma.digitalInvitation.count(),
  ])
  R.paginate(res, items.map(normalizeInvitation), total, page, limit)
}

export async function getInvitation(req: AuthRequest, res: Response): Promise<void> {
  const item = await prisma.digitalInvitation.findUnique({
    where: { id: req.params.id },
    include: { client: { select: { id: true, name: true, email: true } } },
  })
  if (!item) { R.notFound(res); return }
  R.success(res, normalizeInvitation(item))
}

export async function createInvitation(req: AuthRequest, res: Response): Promise<void> {
  const {
    clientId, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue, gallery, isPublished, rsvpDeadline,
  } = req.body

  const shareToken = uuidv4()
  const invitation = await prisma.digitalInvitation.create({
    data: {
      clientId,
      eventType, title, names, eventDate, eventTime, venue, locationNote,
      message, quote, hashtag,
      template: template || 'elegante',
      primaryColor: primaryColor || '#1a2744',
      textColor: textColor || '#F5F0E8',
      fontStyle: fontStyle || 'serif',
      isDark: isDark !== false,
      isPublished: isPublished !== false,
      dressCode,
      rsvpLabel,
      rsvpValue,
      rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : undefined,
      gallery: serializeGallery(gallery),
      shareToken,
    },
  })
  R.created(res, normalizeInvitation(invitation))
}

export async function updateInvitation(req: AuthRequest, res: Response): Promise<void> {
  const payload = { ...req.body }
  if (payload.gallery) {
    payload.gallery = serializeGallery(payload.gallery)
  }

  const invitation = await prisma.digitalInvitation.update({
    where: { id: req.params.id },
    data: payload,
  })
  R.success(res, normalizeInvitation(invitation))
}

export async function deleteInvitation(req: AuthRequest, res: Response): Promise<void> {
  await prisma.digitalInvitation.delete({ where: { id: req.params.id } })
  R.noContent(res)
}

export async function toggleInvitationPublished(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findUnique({ where: { id: req.params.id } })
  if (!existing) { R.notFound(res); return }
  const updated = await prisma.digitalInvitation.update({
    where: { id: req.params.id },
    data: { isPublished: !existing.isPublished },
  })
  R.success(res, normalizeInvitation(updated))
}

export async function addInvitationPhotos(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findUnique({ where: { id: req.params.id } })
  if (!existing) { R.notFound(res); return }

  const files = (req.files || []) as Express.Multer.File[]
  const urls = files.map(file => `/uploads/${file.filename}`)
  const current = parseGallery(existing.gallery)
  const updated = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: { gallery: JSON.stringify([...current, ...urls]) },
  })
  R.success(res, normalizeInvitation(updated))
}

export async function listGuestsByInvitation(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findUnique({ where: { id: req.params.id } })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const guests = await prisma.invitationGuest.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: 'asc' },
  })
  R.success(res, guests)
}

export async function addGuestsByInvitation(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findUnique({ where: { id: req.params.id } })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const { names } = req.body
  if (!Array.isArray(names) || names.length === 0) {
    R.badRequest(res, 'Se requiere un array de nombres')
    return
  }

  const guests = await Promise.all(
    (names as string[])
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => prisma.invitationGuest.create({ data: { invitationId: invitation.id, name } }))
  )

  R.created(res, guests, 'Invitados agregados')
}

export async function deleteGuestByInvitation(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findUnique({ where: { id: req.params.id } })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const guest = await prisma.invitationGuest.findFirst({
    where: { id: req.params.gid, invitationId: invitation.id },
  })
  if (!guest) { R.notFound(res, 'Invitado no encontrado'); return }

  await prisma.invitationGuest.delete({ where: { id: guest.id } })
  R.noContent(res)
}

export async function getSettings(_req: AuthRequest, res: Response): Promise<void> {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  })
  R.success(res, settings)
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: req.body,
    create: { id: 'main', ...req.body },
  })
  R.success(res, settings, 'Configuración actualizada')
}
