import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/roles'
import { uploadImage } from '../middleware/upload'
import * as admin from '../controllers/adminController'

const router = Router()

// Todas las rutas admin requieren autenticación + rol ADMIN
router.use(authenticate, requireAdmin)

// Dashboard
router.get('/dashboard', admin.getDashboard)

// Contactos
router.get('/contacts', admin.listContacts)
router.get('/contacts/:id', admin.getContact)
router.patch('/contacts/:id', admin.updateContact)
router.delete('/contacts/:id', admin.deleteContact)

// Reservas
router.get('/bookings', admin.listBookings)
router.get('/bookings/:id', admin.getBooking)
router.patch('/bookings/:id', admin.updateBooking)

// Portfolio
router.get('/portfolio', admin.listPortfolio)
router.post('/portfolio', uploadImage.single('image'), admin.createPortfolioItem)
router.put('/portfolio/:id', uploadImage.single('image'), admin.updatePortfolioItem)
router.delete('/portfolio/:id', admin.deletePortfolioItem)

// Testimonios
router.get('/testimonials', admin.listTestimonials)
router.post('/testimonials', admin.createTestimonial)
router.put('/testimonials/:id', admin.updateTestimonial)
router.delete('/testimonials/:id', admin.deleteTestimonial)

// Servicios
router.get('/services', admin.listServices)
router.put('/services/:id', admin.updateService)

// Clientes
router.get('/clients', admin.listClients)
router.post('/clients', admin.createClient)
router.patch('/clients/:id/toggle-status', admin.toggleClientStatus)

// Invitaciones digitales
router.get('/invitations', admin.listInvitations)
router.get('/invitations/:id', admin.getInvitation)
router.post('/invitations', admin.createInvitation)
router.put('/invitations/:id', admin.updateInvitation)
router.delete('/invitations/:id', admin.deleteInvitation)
router.patch('/invitations/:id/toggle-published', admin.toggleInvitationPublished)
router.post('/invitations/:id/photos', uploadImage.array('images', 8), admin.addInvitationPhotos)
router.get('/invitations/:id/guests', admin.listGuestsByInvitation)
router.post('/invitations/:id/guests', admin.addGuestsByInvitation)
router.delete('/invitations/:id/guests/:gid', admin.deleteGuestByInvitation)

// Configuración del sitio
router.get('/settings', admin.getSettings)
router.put('/settings', admin.updateSettings)

export default router
