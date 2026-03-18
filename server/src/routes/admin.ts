import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/roles'
import { uploadImage, uploadAudio } from '../middleware/upload'
import * as admin from '../controllers/adminController'
import * as notifications from '../controllers/notificationController'

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
router.get('/bookings/archived', admin.getArchivedBookings)
router.get('/history/bookings', admin.listBookingHistory)
router.get('/bookings/:id', admin.getBooking)
router.patch('/bookings/:id', admin.updateBooking)
router.post('/bookings/:id/archive', admin.archiveBooking)
router.post('/bookings/:id/unarchive', admin.unarchiveBooking)

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

// Cuentas de acceso
router.get('/accounts', admin.listAccounts)
router.post('/accounts', admin.createAccount)
router.patch('/accounts/:id/toggle-status', admin.toggleAccountStatus)

// Invitaciones digitales
router.get('/invitations', admin.listInvitations)
router.get('/invitations/archived', admin.getArchivedInvitations)
router.get('/history/invitations', admin.listInvitationHistory)
router.get('/invitations/:id', admin.getInvitation)
router.post('/invitations', admin.createInvitation)
router.put('/invitations/:id', admin.updateInvitation)
router.delete('/invitations/:id', admin.deleteInvitation)
router.post('/invitations/:id/archive', admin.archiveInvitation)
router.post('/invitations/:id/unarchive', admin.unarchiveInvitation)
router.patch('/invitations/:id/toggle-published', admin.toggleInvitationPublished)
router.post('/invitations/:id/photos', uploadImage.array('images', 8), admin.addInvitationPhotos)
router.delete('/invitations/:id/photos/:index', admin.deleteInvitationPhoto)
router.post('/invitations/:id/custom-template', uploadImage.single('template'), admin.uploadCustomTemplate)
router.post('/invitations/:id/custom-template-pages', uploadImage.array('pages', 4), admin.uploadCustomTemplatePages)
router.post('/invitations/:id/music', uploadAudio.single('audio'), admin.addInvitationMusic)
router.get('/invitations/:id/guests', admin.listGuestsByInvitation)
router.post('/invitations/:id/guests', admin.addGuestsByInvitation)
router.patch('/invitations/:id/guests/:gid', admin.updateGuestByInvitation)
router.delete('/invitations/:id/guests/:gid', admin.deleteGuestByInvitation)

// Configuración del sitio
router.get('/settings', admin.getSettings)
router.put('/settings', admin.updateSettings)

// Notificaciones de actividad
router.get('/notifications', notifications.listNotifications)
router.patch('/notifications/mark-all-read', notifications.markAllRead)
router.patch('/notifications/:id/read', notifications.markRead)

export default router
