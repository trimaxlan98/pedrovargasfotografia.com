"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const upload_1 = require("../middleware/upload");
const admin = __importStar(require("../controllers/adminController"));
const router = (0, express_1.Router)();
// Todas las rutas admin requieren autenticación + rol ADMIN
router.use(auth_1.authenticate, roles_1.requireAdmin);
// Dashboard
router.get('/dashboard', admin.getDashboard);
// Contactos
router.get('/contacts', admin.listContacts);
router.get('/contacts/:id', admin.getContact);
router.patch('/contacts/:id', admin.updateContact);
router.delete('/contacts/:id', admin.deleteContact);
// Reservas
router.get('/bookings', admin.listBookings);
router.get('/bookings/:id', admin.getBooking);
router.patch('/bookings/:id', admin.updateBooking);
// Portfolio
router.get('/portfolio', admin.listPortfolio);
router.post('/portfolio', upload_1.uploadImage.single('image'), admin.createPortfolioItem);
router.put('/portfolio/:id', upload_1.uploadImage.single('image'), admin.updatePortfolioItem);
router.delete('/portfolio/:id', admin.deletePortfolioItem);
// Testimonios
router.get('/testimonials', admin.listTestimonials);
router.post('/testimonials', admin.createTestimonial);
router.put('/testimonials/:id', admin.updateTestimonial);
router.delete('/testimonials/:id', admin.deleteTestimonial);
// Servicios
router.get('/services', admin.listServices);
router.put('/services/:id', admin.updateService);
// Clientes
router.get('/clients', admin.listClients);
router.post('/clients', admin.createClient);
router.patch('/clients/:id/toggle-status', admin.toggleClientStatus);
// Invitaciones digitales
router.get('/invitations', admin.listInvitations);
router.get('/invitations/:id', admin.getInvitation);
router.post('/invitations', admin.createInvitation);
router.put('/invitations/:id', admin.updateInvitation);
router.delete('/invitations/:id', admin.deleteInvitation);
router.patch('/invitations/:id/toggle-published', admin.toggleInvitationPublished);
router.post('/invitations/:id/photos', upload_1.uploadImage.array('images', 8), admin.addInvitationPhotos);
router.get('/invitations/:id/guests', admin.listGuestsByInvitation);
router.post('/invitations/:id/guests', admin.addGuestsByInvitation);
router.delete('/invitations/:id/guests/:gid', admin.deleteGuestByInvitation);
// Configuración del sitio
router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);
exports.default = router;
//# sourceMappingURL=admin.js.map