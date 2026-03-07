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
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const upload_1 = require("../middleware/upload");
const client = __importStar(require("../controllers/clientController"));
const router = (0, express_1.Router)();
// Todas las rutas cliente requieren autenticación
router.use(auth_1.authenticate, roles_1.requireClient);
const bookingValidation = [
    (0, express_validator_1.body)('service').trim().notEmpty().withMessage('El servicio es requerido'),
    (0, express_validator_1.body)('eventDate').isISO8601().withMessage('Fecha inválida'),
    (0, express_validator_1.body)('eventType').trim().notEmpty().withMessage('El tipo de evento es requerido'),
];
const invitationValidation = [
    (0, express_validator_1.body)('eventType').trim().notEmpty().withMessage('El tipo de evento es requerido'),
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('El título es requerido'),
    (0, express_validator_1.body)('names').trim().notEmpty().withMessage('Los nombres son requeridos'),
    (0, express_validator_1.body)('eventDate').trim().notEmpty().withMessage('La fecha es requerida'),
];
// Reservas
router.get('/bookings', client.getMyBookings);
router.get('/history/bookings', client.getMyBookingHistory);
router.get('/bookings/:id', client.getMyBooking);
router.post('/bookings', bookingValidation, client.createBooking);
router.patch('/bookings/:id/cancel', client.cancelBooking);
// Invitaciones digitales
router.get('/invitations', client.getMyInvitations);
router.get('/history/invitations', client.getMyInvitationHistory);
router.get('/invitations/:id', client.getMyInvitation);
router.post('/invitations', invitationValidation, client.createInvitation);
router.put('/invitations/:id', client.updateInvitation);
router.post('/invitations/:id/archive', client.archiveInvitation);
router.delete('/invitations/:id', client.deleteInvitation);
router.patch('/invitations/:id/toggle-published', client.toggleInvitationPublished);
router.post('/invitations/:id/photos', upload_1.uploadImage.array('images', 8), client.addInvitationPhotos);
router.get('/invitations/:id/guests', client.listGuests);
router.post('/invitations/:id/guests', client.addGuests);
router.post('/invitations/:id/guests/dev-seed', client.seedGuestsForDevelopment);
router.delete('/invitations/:id/guests/:gid', client.deleteGuest);
exports.default = router;
//# sourceMappingURL=client.js.map