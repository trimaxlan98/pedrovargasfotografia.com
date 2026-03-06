import { Router } from 'express'
import prisma from '../utils/prisma'
import * as R from '../utils/response'

const router = Router()

function parseGallery(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// GET /api/public/portfolio
router.get('/portfolio', async (req, res) => {
  const { category, featured } = req.query
  const where: Record<string, unknown> = { isVisible: true }
  if (category) where.category = String(category)
  if (featured === 'true') where.featured = true

  const items = await prisma.portfolioItem.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })
  R.success(res, items)
})

// GET /api/public/testimonials
router.get('/testimonials', async (_req, res) => {
  const items = await prisma.testimonial.findMany({
    where: { isVisible: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })
  R.success(res, items)
})

// GET /api/public/services
router.get('/services', async (_req, res) => {
  const items = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  const parsed = items.map(s => ({
    ...s,
    features: JSON.parse(s.features || '[]'),
  }))
  R.success(res, parsed)
})

// GET /api/public/settings
router.get('/settings', async (_req, res) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
  R.success(res, settings)
})

// GET /api/public/guest/:guestToken  — invitación del invitado individual
router.get('/guest/:guestToken', async (req, res) => {
  const guest = await prisma.invitationGuest.findUnique({
    where: { token: req.params.guestToken },
    include: { invitation: true },
  })
  if (!guest || !guest.invitation.isPublished) {
    R.notFound(res, 'Invitación no encontrada')
    return
  }
  const { invitation } = guest
  R.success(res, {
    guest: {
      id: guest.id,
      name: guest.name,
      token: guest.token,
      response: guest.response,
      respondedAt: guest.respondedAt,
      personalizedMessage: guest.personalizedMessage,
    },
    invitation: { ...invitation, gallery: parseGallery(invitation.gallery) },
  })
})

// POST /api/public/guest/:guestToken/rsvp  — respuesta RSVP
router.post('/guest/:guestToken/rsvp', async (req, res) => {
  const { response } = req.body
  if (!['ACCEPTED', 'DECLINED'].includes(response)) {
    R.badRequest(res, 'Respuesta inválida. Use ACCEPTED o DECLINED')
    return
  }

  const guest = await prisma.invitationGuest.findUnique({
    where: { token: req.params.guestToken },
    include: { invitation: true },
  })
  if (!guest || !guest.invitation.isPublished) {
    R.notFound(res, 'Invitación no encontrada')
    return
  }

  // Check deadline
  if (guest.invitation.rsvpDeadline && new Date() > new Date(guest.invitation.rsvpDeadline)) {
    R.badRequest(res, 'El plazo para responder ha vencido')
    return
  }

  const updated = await prisma.invitationGuest.update({
    where: { id: guest.id },
    data: { response, respondedAt: new Date() },
  })
  R.success(res, updated, response === 'ACCEPTED' ? '¡Gracias por confirmar tu asistencia!' : 'Recibimos tu respuesta, lamentamos que no puedas asistir.')
})

// GET /api/public/invitation/:token  — vista pública de invitación
router.get('/invitation/:token', async (req, res) => {
  const invitation = await prisma.digitalInvitation.findUnique({
    where: { shareToken: req.params.token },
  })
  if (!invitation || !invitation.isPublished) {
    R.notFound(res, 'Invitación no encontrada')
    return
  }
  // Incrementar contador de vistas
  await prisma.digitalInvitation.update({
    where: { id: invitation.id },
    data: { views: { increment: 1 } },
  })
  R.success(res, { ...invitation, gallery: parseGallery(invitation.gallery) })
})

export default router
