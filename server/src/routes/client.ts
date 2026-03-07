import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middleware/auth'
import { requireClient } from '../middleware/roles'
import { uploadImage } from '../middleware/upload'
import * as client from '../controllers/clientController'

const router = Router()

// Todas las rutas cliente requieren autenticación
router.use(authenticate, requireClient)

const bookingValidation = [
  body('service').trim().notEmpty().withMessage('El servicio es requerido'),
  body('eventDate').isISO8601().withMessage('Fecha inválida'),
  body('eventType').trim().notEmpty().withMessage('El tipo de evento es requerido'),
]

const invitationValidation = [
  body('eventType').trim().notEmpty().withMessage('El tipo de evento es requerido'),
  body('title').trim().notEmpty().withMessage('El título es requerido'),
  body('names').trim().notEmpty().withMessage('Los nombres son requeridos'),
  body('eventDate').trim().notEmpty().withMessage('La fecha es requerida'),
]

// Reservas
router.get('/bookings', client.getMyBookings)
router.get('/history/bookings', client.getMyBookingHistory)
router.get('/bookings/:id', client.getMyBooking)
router.post('/bookings', bookingValidation, client.createBooking)
router.patch('/bookings/:id/cancel', client.cancelBooking)

// Invitaciones digitales
router.get('/invitations', client.getMyInvitations)
router.get('/history/invitations', client.getMyInvitationHistory)
router.get('/invitations/:id', client.getMyInvitation)
router.post('/invitations', invitationValidation, client.createInvitation)
router.put('/invitations/:id', client.updateInvitation)
router.delete('/invitations/:id', client.deleteInvitation)
router.patch('/invitations/:id/toggle-published', client.toggleInvitationPublished)
router.post('/invitations/:id/photos', uploadImage.array('images', 8), client.addInvitationPhotos)
router.get('/invitations/:id/guests', client.listGuests)
router.post('/invitations/:id/guests', client.addGuests)
router.post('/invitations/:id/guests/dev-seed', client.seedGuestsForDevelopment)
router.patch('/invitations/:id/guests/:gid', client.updateGuest)
router.delete('/invitations/:id/guests/:gid', client.deleteGuest)

export default router
