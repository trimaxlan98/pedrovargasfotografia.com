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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const R = __importStar(require("../utils/response"));
const router = (0, express_1.Router)();
function parseGallery(raw) {
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
// GET /api/public/portfolio
router.get('/portfolio', async (req, res) => {
    const { category, featured } = req.query;
    const where = { isVisible: true };
    if (category)
        where.category = String(category);
    if (featured === 'true')
        where.featured = true;
    const items = await prisma_1.default.portfolioItem.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });
    R.success(res, items);
});
// GET /api/public/testimonials
router.get('/testimonials', async (_req, res) => {
    const items = await prisma_1.default.testimonial.findMany({
        where: { isVisible: true },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    R.success(res, items);
});
// GET /api/public/services
router.get('/services', async (_req, res) => {
    const items = await prisma_1.default.service.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
    });
    const parsed = items.map(s => ({
        ...s,
        features: JSON.parse(s.features || '[]'),
    }));
    R.success(res, parsed);
});
// GET /api/public/settings
router.get('/settings', async (_req, res) => {
    const settings = await prisma_1.default.siteSettings.findUnique({ where: { id: 'main' } });
    R.success(res, settings);
});
// GET /api/public/guest/:guestToken  — invitación del invitado individual
router.get('/guest/:guestToken', async (req, res) => {
    const guest = await prisma_1.default.invitationGuest.findUnique({
        where: { token: req.params.guestToken },
        include: { invitation: true },
    });
    if (!guest || !guest.invitation.isPublished || guest.invitation.archivedAt) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const { invitation } = guest;
    R.success(res, {
        guest: {
            id: guest.id,
            name: guest.name,
            token: guest.token,
            response: guest.response,
            respondedAt: guest.respondedAt,
            personalizedMessage: guest.personalizedMessage,
            tableNumber: guest.tableNumber,
        },
        invitation: { ...invitation, gallery: parseGallery(invitation.gallery) },
    });
});
// POST /api/public/guest/:guestToken/rsvp  — respuesta RSVP
router.post('/guest/:guestToken/rsvp', async (req, res) => {
    const { response } = req.body;
    if (!['ACCEPTED', 'DECLINED'].includes(response)) {
        R.badRequest(res, 'Respuesta inválida. Use ACCEPTED o DECLINED');
        return;
    }
    const guest = await prisma_1.default.invitationGuest.findUnique({
        where: { token: req.params.guestToken },
        include: { invitation: true },
    });
    if (!guest || !guest.invitation.isPublished || guest.invitation.archivedAt) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    // Check deadline
    if (guest.invitation.rsvpDeadline && new Date() > new Date(guest.invitation.rsvpDeadline)) {
        R.badRequest(res, 'El plazo para responder ha vencido');
        return;
    }
    const updated = await prisma_1.default.invitationGuest.update({
        where: { id: guest.id },
        data: { response, respondedAt: new Date() },
    });
    R.success(res, updated, response === 'ACCEPTED' ? '¡Gracias por confirmar tu asistencia!' : 'Recibimos tu respuesta, lamentamos que no puedas asistir.');
});
// GET /api/public/invitation/:token  — vista pública de invitación
router.get('/invitation/:token', async (req, res) => {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: {
            shareToken: req.params.token,
            archivedAt: null,
        },
    });
    if (!invitation || !invitation.isPublished) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    // Incrementar contador de vistas
    await prisma_1.default.digitalInvitation.update({
        where: { id: invitation.id },
        data: { views: { increment: 1 } },
    });
    R.success(res, { ...invitation, gallery: parseGallery(invitation.gallery) });
});
exports.default = router;
//# sourceMappingURL=public.js.map