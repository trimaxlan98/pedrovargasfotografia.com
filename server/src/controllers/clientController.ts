import { Response } from 'express'
import { validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../utils/prisma'
import { AuthRequest } from '../types'
import * as R from '../utils/response'
import { sendBookingConfirmation } from '../utils/email'
import { logActivity } from '../utils/activityLogger'
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

const MANUAL_ARCHIVE_REASON = 'MANUAL_DELETE'

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

// ─── RESERVAS DEL CLIENTE ──────────────────────────────────────────────────────

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  const bookings = await prisma.booking.findMany({
    where: { clientId: req.user!.userId, archivedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  R.success(res, bookings)
}

export async function getMyBookingHistory(req: AuthRequest, res: Response): Promise<void> {
  const bookings = await prisma.booking.findMany({
    where: { clientId: req.user!.userId, archivedAt: { not: null } },
    orderBy: { archivedAt: 'desc' },
  })
  R.success(res, bookings)
}

export async function getMyBooking(req: AuthRequest, res: Response): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!booking) { R.notFound(res, 'Reserva no encontrada'); return }
  R.success(res, booking)
}

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '))
    return
  }

  const { service, eventDate, eventType, venue, guestCount, budget, notes } = req.body

  const booking = await prisma.booking.create({
    data: {
      clientId: req.user!.userId,
      service,
      eventDate: new Date(eventDate),
      eventType,
      venue,
      guestCount: guestCount ? Number(guestCount) : undefined,
      budget: budget ? Number(budget) : undefined,
      notes,
    },
  })

  // Notificación por email
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (user) {
    sendBookingConfirmation({
      to: user.email,
      name: user.name,
      service,
      eventDate: new Date(eventDate).toLocaleDateString('es-MX'),
      bookingId: booking.id,
    }).catch(console.error)
  }

  if (user) {
    logActivity({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'BOOKING_CREATED',
      detail: `Nueva reserva: ${service} — ${eventType}`,
    })
  }

  R.created(res, booking, 'Reserva creada. Te contactaremos para confirmar los detalles.')
}

export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!booking) { R.notFound(res, 'Reserva no encontrada'); return }
  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    R.badRequest(res, 'Esta reserva no se puede cancelar'); return
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  })

  const cancelUser = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true, email: true } })
  if (cancelUser) {
    logActivity({
      userId: req.user!.userId,
      userName: cancelUser.name,
      userEmail: cancelUser.email,
      action: 'BOOKING_CANCELLED',
      detail: `Reserva cancelada: ${booking.service} — ${booking.eventType}`,
    })
  }

  R.success(res, updated, 'Reserva cancelada')
}

// ─── INVITACIONES DIGITALES DEL CLIENTE ───────────────────────────────────────

export async function getMyInvitations(req: AuthRequest, res: Response): Promise<void> {
  const invitations = await prisma.digitalInvitation.findMany({
    where: { clientId: req.user!.userId, archivedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  const normalized = invitations.map(normalizeInvitation)
  const withStats = await appendGuestStats(normalized)
  R.success(res, withStats)
}

export async function getMyInvitationHistory(req: AuthRequest, res: Response): Promise<void> {
  const invitations = await prisma.digitalInvitation.findMany({
    where: { clientId: req.user!.userId, archivedAt: { not: null } },
    orderBy: { archivedAt: 'desc' },
  })
  const normalized = invitations.map(normalizeInvitation)
  const withStats = await appendGuestStats(normalized)
  R.success(res, withStats)
}

export async function getMyInvitation(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }
  const [withStats] = await appendGuestStats([normalizeInvitation(invitation)])
  R.success(res, withStats)
}

export async function createInvitation(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '))
    return
  }

  const {
    invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery,
    isPublished, rsvpDeadline, guestGreeting, defaultGuestName,
    ceremonyVenue, ceremonyAddress, ceremonyTime, ceremonyPhoto, ceremonyMapUrl,
    receptionVenue, receptionAddress, receptionTime, receptionPhoto, receptionMapUrl,
    parentsInfo, sponsorsInfo, giftsInfo, instagramHandle, enableTableNumber, backgroundMusic,
  } = req.body

  const shareToken = uuidv4()
  const resolvedRsvp = rsvpValue || rsvpContact

  const invitation = await prisma.digitalInvitation.create({
    data: {
      invitationType: invitationType || 'general',
      clientId: req.user!.userId,
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
      ceremonyVenue, ceremonyAddress, ceremonyTime, ceremonyPhoto, ceremonyMapUrl,
      receptionVenue, receptionAddress, receptionTime, receptionPhoto, receptionMapUrl,
      parentsInfo, sponsorsInfo, giftsInfo, instagramHandle,
      enableTableNumber: enableTableNumber === true,
      backgroundMusic: backgroundMusic || null,
    },
  })
  const invUser = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true, email: true } })
  if (invUser) {
    logActivity({
      userId: req.user!.userId,
      userName: invUser.name,
      userEmail: invUser.email,
      action: 'INVITATION_CREATED',
      detail: `Nueva invitación: ${title} (${eventType})`,
    })
  }

  R.created(res, normalizeInvitation(invitation), 'Invitación creada exitosamente')
}

export async function updateInvitation(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  const {
    invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery,
    isPublished, rsvpDeadline, guestGreeting, defaultGuestName,
    ceremonyVenue, ceremonyAddress, ceremonyTime, ceremonyPhoto, ceremonyMapUrl,
    receptionVenue, receptionAddress, receptionTime, receptionPhoto, receptionMapUrl,
    parentsInfo, sponsorsInfo, giftsInfo, instagramHandle, enableTableNumber, backgroundMusic,
  } = req.body

  // rsvpContact is a legacy alias — null must be allowed to clear the field
  const resolvedRsvpValue = rsvpValue !== undefined ? rsvpValue : (rsvpContact !== undefined ? rsvpContact : undefined)

  const payload: any = {
    invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
    message, quote, hashtag, template, primaryColor, textColor, fontStyle,
    isDark, dressCode, rsvpLabel, rsvpValue: resolvedRsvpValue, heroImage,
    isPublished, guestGreeting, defaultGuestName,
    ceremonyVenue, ceremonyAddress, ceremonyTime, ceremonyPhoto, ceremonyMapUrl,
    receptionVenue, receptionAddress, receptionTime, receptionPhoto, receptionMapUrl,
    parentsInfo, sponsorsInfo, giftsInfo, instagramHandle,
  }

  if (enableTableNumber !== undefined) {
    payload.enableTableNumber = enableTableNumber === true
  }

  if (backgroundMusic !== undefined) {
    payload.backgroundMusic = backgroundMusic || null
  }

  if (gallery !== undefined) {
    payload.gallery = serializeGallery(gallery)
  }
  if (rsvpDeadline !== undefined) {
    payload.rsvpDeadline = rsvpDeadline ? new Date(rsvpDeadline) : null
  }

  // Limpiar campos undefined para evitar errores de Prisma
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])

  const invitation = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: payload,
  })
  R.success(res, normalizeInvitation(invitation), 'Invitación actualizada')
}

export async function deleteInvitation(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
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

  const delUser = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true, email: true } })
  if (delUser) {
    logActivity({
      userId: req.user!.userId,
      userName: delUser.name,
      userEmail: delUser.email,
      action: 'INVITATION_DELETED',
      detail: `Invitación eliminada: ${existing.title}`,
    })
  }

  R.noContent(res)
}

export async function toggleInvitationPublished(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  const updated = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: { isPublished: !existing.isPublished },
  })
  R.success(res, normalizeInvitation(updated), `Invitación ${updated.isPublished ? 'publicada' : 'despublicada'}`)
}

// ─── INVITADOS (GUESTS) ────────────────────────────────────────────────────────

export async function addGuests(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const { names, guests: guestsInput } = req.body
  
  if (guestsInput && Array.isArray(guestsInput)) {
    // Nuevo formato: array de objetos { name, personalizedMessage }
    const created = await Promise.all(
      guestsInput.map(g => 
        prisma.invitationGuest.create({ 
          data: { 
            invitationId: invitation.id, 
            name: g.name.trim(),
            personalizedMessage: g.personalizedMessage
          } 
        })
      )
    )
    R.created(res, created, 'Invitados agregados')
    return
  }

  if (!Array.isArray(names) || names.length === 0) {
    R.badRequest(res, 'Se requiere un array de nombres o invitados'); return
  }

  const guests = await Promise.all(
    (names as string[])
      .map(n => n.trim())
      .filter(Boolean)
      .map(name => prisma.invitationGuest.create({ data: { invitationId: invitation.id, name } }))
  )
  R.created(res, guests, 'Invitados agregados')
}

export async function seedGuestsForDevelopment(req: AuthRequest, res: Response): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    R.forbidden(res, 'Acción no disponible en producción')
    return
  }

  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const now = new Date()
  const testGuests: Array<{ name: string; response: 'PENDING' | 'ACCEPTED' | 'DECLINED'; respondedAt?: Date }> = [
    { name: 'Invitado de prueba 1', response: 'ACCEPTED', respondedAt: now },
    { name: 'Invitado de prueba 2', response: 'ACCEPTED', respondedAt: new Date(now.getTime() - 86400000) },
    { name: 'Invitado de prueba 3', response: 'PENDING' },
    { name: 'Invitado de prueba 4', response: 'PENDING' },
    { name: 'Invitado de prueba 5', response: 'DECLINED', respondedAt: new Date(now.getTime() - 172800000) },
  ]

  const created = await prisma.$transaction(
    testGuests.map(guest =>
      prisma.invitationGuest.create({
        data: {
          invitationId: invitation.id,
          name: guest.name,
          response: guest.response,
          respondedAt: guest.respondedAt,
        },
      })
    )
  )

  R.created(res, created, 'Se crearon 5 invitados de prueba')
}

export async function listGuests(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const guests = await prisma.invitationGuest.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: 'asc' },
  })
  R.success(res, guests)
}

export async function updateGuest(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const guest = await prisma.invitationGuest.findFirst({
    where: { id: req.params.gid, invitationId: invitation.id },
  })
  if (!guest) { R.notFound(res, 'Invitado no encontrado'); return }

  const { personalizedMessage, tableNumber } = req.body
  const data: any = {}
  if (personalizedMessage !== undefined) data.personalizedMessage = personalizedMessage || null
  if (tableNumber !== undefined) data.tableNumber = tableNumber !== null ? Number(tableNumber) : null
  const updated = await prisma.invitationGuest.update({
    where: { id: guest.id },
    data,
  })
  R.success(res, updated, 'Invitado actualizado')
}

export async function deleteGuest(req: AuthRequest, res: Response): Promise<void> {
  const invitation = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!invitation) { R.notFound(res, 'Invitación no encontrada'); return }

  const guest = await prisma.invitationGuest.findFirst({
    where: { id: req.params.gid, invitationId: invitation.id },
  })
  if (!guest) { R.notFound(res, 'Invitado no encontrado'); return }

  await prisma.invitationGuest.delete({ where: { id: guest.id } })
  R.noContent(res)
}

// ──────────────────────────────────────────────────────────────────────────────

export async function addInvitationPhotos(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  const files = (req.files || []) as Express.Multer.File[]
  const urls = files.map(file => `/uploads/${file.filename}`)
  const current = parseGallery(existing.gallery)
  const updated = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: { gallery: JSON.stringify([...current, ...urls]) },
  })
  R.success(res, normalizeInvitation(updated), 'Fotos agregadas')
}

export async function addInvitationMusic(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  const file = req.file as Express.Multer.File | undefined
  if (!file) { R.badRequest(res, 'Se requiere un archivo de audio'); return }

  const url = `/uploads/${file.filename}`
  const updated = await prisma.digitalInvitation.update({
    where: { id: existing.id },
    data: { backgroundMusic: url },
  })
  R.success(res, normalizeInvitation(updated), 'Música agregada')
}

export async function archiveInvitation(req: AuthRequest, res: Response): Promise<void> {
  const { reason } = req.body
  const existing = await prisma.digitalInvitation.findFirst({
    where: { id: req.params.id, clientId: req.user!.userId, archivedAt: null },
  })
  if (!existing) { R.notFound(res, 'Invitación no encontrada'); return }

  const invitation = await archivalService.archiveInvitation(existing.id, reason)
  R.success(res, normalizeInvitation(invitation), 'Invitación archivada')
}

