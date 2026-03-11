import { Response } from 'express'
import prisma from '../utils/prisma'
import { v4 as uuidv4 } from 'uuid'
import { hashPassword } from '../utils/password'
import { AuthRequest } from '../types'
import * as R from '../utils/response'
import * as archivalService from '../services/archivalService'

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

interface GuestStats {
  total: number
  confirmed: number
  pending: number
  declined: number
}

function emptyGuestStats(): GuestStats {
  return { total: 0, confirmed: 0, pending: 0, declined: 0 }
}

async function appendGuestStats<T extends { id: string }>(invitations: T[]): Promise<Array<T & { guestStats: GuestStats }>> {
  if (invitations.length === 0) return []

  const grouped = await prisma.invitationGuest.groupBy({
    by: ['invitationId', 'response'],
    where: { invitationId: { in: invitations.map(i => i.id) } },
    _count: { _all: true },
  })

  const byInvitation = new Map<string, GuestStats>()
  for (const row of grouped) {
    const stats = byInvitation.get(row.invitationId) ?? emptyGuestStats()
    const count = row._count._all
    stats.total += count
    if (row.response === 'ACCEPTED') stats.confirmed += count
    if (row.response === 'PENDING') stats.pending += count
    if (row.response === 'DECLINED') stats.declined += count
    byInvitation.set(row.invitationId, stats)
  }

  return invitations.map(inv => ({
    ...inv,
    guestStats: byInvitation.get(inv.id) ?? emptyGuestStats(),
  }))
}

const MANUAL_ARCHIVE_REASON = 'MANUAL_DELETE'

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
    prisma.booking.count({ where: { archivedAt: null } }),
    prisma.booking.count({ where: { status: 'PENDING', archivedAt: null } }),
    prisma.booking.count({ where: { status: 'CONFIRMED', archivedAt: null } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.portfolioItem.count(),
    prisma.contactRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      take: 5,
      where: { archivedAt: null },
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
  const where: Record<string, unknown> = { archivedAt: null }
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

export async function listBookingHistory(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit
  const status = req.query.status as string | undefined
  const where: Record<string, unknown> = { archivedAt: { not: null } }
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { archivedAt: 'desc' },
      include: { client: { select: { id: true, name: true, email: true, phone: true } } },
    }),
    prisma.booking.count({ where }),
  ])
  R.paginate(res, bookings, total, page, limit)
}

export async function getBooking(req: AuthRequest, res: Response): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, archivedAt: null },
    include: { client: { select: { id: true, name: true, email: true, phone: true } } },
  })
  if (!booking) { R.notFound(res); return }
  R.success(res, booking)
}

export async function updateBooking(req: AuthRequest, res: Response): Promise<void> {
  const { status, adminNotes, totalPrice, depositPaid } = req.body
  const existing = await prisma.booking.findFirst({
    where: { id: req.params.id, archivedAt: null },
    select: { id: true },
  })
  if (!existing) { R.notFound(res, 'Reserva no encontrada'); return }

  const booking = await prisma.booking.update({
    where: { id: existing.id },
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

export async function listAccounts(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Number(req.query.limit) || 20)
  const skip = (page - 1) * limit
  const search = (req.query.search as string | undefined)?.trim()
  const role = req.query.role as string | undefined
  const where: Record<string, unknown> = {}

  if (role && ['ADMIN', 'CLIENT'].includes(role)) {
    where.role = role
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [accounts, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  R.paginate(res, accounts, total, page, limit)
}

export async function createAccount(req: AuthRequest, res: Response): Promise<void> {
  const { name, email, phone, password, role } = req.body as {
    name?: string
    email?: string
    phone?: string
    password?: string
    role?: string
  }

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    R.badRequest(res, 'Nombre, correo y contraseña son obligatorios')
    return
  }

  const cleanRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
  const cleanEmail = email.trim().toLowerCase()
  const cleanPassword = password.trim()

  if (cleanPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(cleanPassword)) {
    R.badRequest(res, 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula y número')
    return
  }

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } })
  if (existing) {
    R.conflict(res, 'Ya existe una cuenta con ese correo')
    return
  }

  const hashed = await hashPassword(cleanPassword)
  const account = await prisma.user.create({
    data: {
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || null,
      password: hashed,
      role: cleanRole,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  R.created(res, account, 'Cuenta creada exitosamente')
}

export async function toggleAccountStatus(req: AuthRequest, res: Response): Promise<void> {
  const account = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, role: true, isActive: true },
  })
  if (!account) { R.notFound(res, 'Cuenta no encontrada'); return }

  if (account.id === req.user?.userId && account.isActive) {
    R.badRequest(res, 'No puedes desactivar tu propia cuenta')
    return
  }

  const updated = await prisma.user.update({
    where: { id: account.id },
    data: { isActive: !account.isActive },
    select: { id: true, name: true, role: true, isActive: true },
  })

  R.success(res, updated, `Cuenta ${updated.isActive ? 'activada' : 'desactivada'}`)
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

// Invitaciones digitales

export async function listInvitations(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.digitalInvitation.findMany({
      where: { archivedAt: null },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { id: true, name: true, email: true } } },
    }),
    prisma.digitalInvitation.count({ where: { archivedAt: null } }),
  ])
  const withStats = await appendGuestStats(items.map(normalizeInvitation))
  R.paginate(res, withStats, total, page, limit)
}

export async function listInvitationHistory(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(50, Number(req.query.limit) || 10)
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.digitalInvitation.findMany({
      where: { archivedAt: { not: null } },
      skip,
      take: limit,
      orderBy: { archivedAt: 'desc' },
      include: { client: { select: { id: true, name: true, email: true } } },
    }),
    prisma.digitalInvitation.count({ where: { archivedAt: { not: null } } }),
  ])
  const withStats = await appendGuestStats(items.map(normalizeInvitation))
  R.paginate(res, withStats, total, page, limit)
}

export async function getInvitation(req: AuthRequest, res: Response): Promise<void> {
  const item = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
    include: { client: { select: { id: true, name: true, email: true } } },
  })
  if (!item) { R.notFound(res); return }
  const [withStats] = await appendGuestStats([normalizeInvitation(item)])
  R.success(res, withStats)
}

export async function createInvitation(req: AuthRequest, res: Response): Promise<void> {
  const {
    clientId, invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery,
    isPublished, rsvpDeadline, guestGreeting, defaultGuestName,
  } = req.body

  if (!clientId) { R.badRequest(res, 'Se requiere clientId'); return }

  const clientExists = await prisma.user.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!clientExists) { R.notFound(res, 'Cliente no encontrado'); return }

  const resolvedRsvp = rsvpValue || rsvpContact

  const shareToken = uuidv4()
  const invitation = await prisma.digitalInvitation.create({
    data: {
      invitationType: invitationType || 'general',
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
      rsvpValue: resolvedRsvp,
      heroImage,
      rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : undefined,
      gallery: serializeGallery(gallery),
      shareToken,
      guestGreeting,
      defaultGuestName,
    },
  })
  R.created(res, normalizeInvitation(invitation))
}

export async function updateInvitation(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
    select: { id: true },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  const {
    invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery,
    isPublished, rsvpDeadline, guestGreeting, defaultGuestName,
  } = req.body

  const resolvedRsvpValue = rsvpValue || rsvpContact || undefined

  const payload: any = {
    invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue: resolvedRsvpValue, heroImage,
    isPublished, guestGreeting, defaultGuestName,
  }

  if (gallery !== undefined) {
    payload.gallery = serializeGallery(gallery)
  }
  if (rsvpDeadline !== undefined) {
    payload.rsvpDeadline = rsvpDeadline ? new Date(rsvpDeadline) : null
  }

  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])

  const invitation = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: payload,
  })
  R.success(res, normalizeInvitation(invitation))
}

export async function deleteInvitation(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
    select: { id: true },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: {
      archivedAt: new Date(),
      archiveReason: MANUAL_ARCHIVE_REASON,
      isPublished: false,
    },
  })
  R.noContent(res)
}

export async function toggleInvitationPublished(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
  })
  if (!existing) { R.notFound(res); return }
  const updated = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: { isPublished: !existing.isPublished },
  })
  R.success(res, normalizeInvitation(updated))
}

export async function addInvitationPhotos(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
  })
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
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const guests = await prisma.invitationGuest.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: 'asc' },
  })
  R.success(res, guests)
}

export async function addGuestsByInvitation(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
  })
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
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, archivedAt: null },
  })
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

// ─── ARCHIVADO ────────────────────────────────────────────────────────────────

export async function archiveBooking(req: AuthRequest, res: Response): Promise<void> {
  const { reason } = req.body
  const booking = await archivalService.archiveBooking(req.params.id, reason)
  R.success(res, booking, 'Reserva archivada')
}

export async function unarchiveBooking(req: AuthRequest, res: Response): Promise<void> {
  const booking = await archivalService.unarchiveBooking(req.params.id)
  R.success(res, booking, 'Reserva restaurada')
}

export async function getArchivedBookings(_req: AuthRequest, res: Response): Promise<void> {
  const bookings = await archivalService.getArchivedBookings()
  R.success(res, bookings)
}

export async function archiveInvitation(req: AuthRequest, res: Response): Promise<void> {
  const { reason } = req.body
  const invitation = await archivalService.archiveInvitation(req.params.id, reason)
  R.success(res, normalizeInvitation(invitation), 'Invitación archivada')
}

export async function unarchiveInvitation(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await archivalService.unarchiveInvitation(req.params.id)
  R.success(res, normalizeInvitation(invitation), 'Invitación restaurada')
}

export async function getArchivedInvitations(_req: AuthRequest, res: Response): Promise<void> {
  const invitations = await archivalService.getArchivedInvitations()
  R.success(res, invitations.map(normalizeInvitation))
}

