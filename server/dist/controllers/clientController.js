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
exports.getMyBookings = getMyBookings;
exports.getMyBookingHistory = getMyBookingHistory;
exports.getMyBooking = getMyBooking;
exports.createBooking = createBooking;
exports.cancelBooking = cancelBooking;
exports.getMyInvitations = getMyInvitations;
exports.getMyInvitationHistory = getMyInvitationHistory;
exports.getMyInvitation = getMyInvitation;
exports.createInvitation = createInvitation;
exports.updateInvitation = updateInvitation;
exports.deleteInvitation = deleteInvitation;
exports.toggleInvitationPublished = toggleInvitationPublished;
exports.addGuests = addGuests;
exports.seedGuestsForDevelopment = seedGuestsForDevelopment;
exports.listGuests = listGuests;
exports.updateGuest = updateGuest;
exports.deleteGuest = deleteGuest;
exports.addInvitationPhotos = addInvitationPhotos;
exports.archiveInvitation = archiveInvitation;
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const prisma_1 = __importDefault(require("../utils/prisma"));
const R = __importStar(require("../utils/response"));
const email_1 = require("../utils/email");
const activityLogger_1 = require("../utils/activityLogger");
const archivalService = __importStar(require("../services/archivalService"));
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
function normalizeInvitation(invitation) {
    return {
        ...invitation,
        gallery: parseGallery(invitation.gallery),
    };
}
function serializeGallery(input) {
    if (!input)
        return undefined;
    if (Array.isArray(input))
        return JSON.stringify(input);
    if (typeof input === 'string')
        return input;
    return undefined;
}
const MANUAL_ARCHIVE_REASON = 'MANUAL_DELETE';
function emptyGuestStats() {
    return { total: 0, confirmed: 0, pending: 0, declined: 0 };
}
async function appendGuestStats(invitations) {
    if (invitations.length === 0)
        return [];
    const grouped = await prisma_1.default.invitationGuest.groupBy({
        by: ['invitationId', 'response'],
        where: { invitationId: { in: invitations.map(i => i.id) } },
        _count: { _all: true },
    });
    const byInvitation = new Map();
    for (const row of grouped) {
        const stats = byInvitation.get(row.invitationId) ?? emptyGuestStats();
        const count = row._count._all;
        stats.total += count;
        if (row.response === 'ACCEPTED')
            stats.confirmed += count;
        if (row.response === 'PENDING')
            stats.pending += count;
        if (row.response === 'DECLINED')
            stats.declined += count;
        byInvitation.set(row.invitationId, stats);
    }
    return invitations.map(inv => ({
        ...inv,
        guestStats: byInvitation.get(inv.id) ?? emptyGuestStats(),
    }));
}
// ─── RESERVAS DEL CLIENTE ──────────────────────────────────────────────────────
async function getMyBookings(req, res) {
    const bookings = await prisma_1.default.booking.findMany({
        where: { clientId: req.user.userId, archivedAt: null },
        orderBy: { createdAt: 'desc' },
    });
    R.success(res, bookings);
}
async function getMyBookingHistory(req, res) {
    const bookings = await prisma_1.default.booking.findMany({
        where: { clientId: req.user.userId, archivedAt: { not: null } },
        orderBy: { archivedAt: 'desc' },
    });
    R.success(res, bookings);
}
async function getMyBooking(req, res) {
    const booking = await prisma_1.default.booking.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!booking) {
        R.notFound(res, 'Reserva no encontrada');
        return;
    }
    R.success(res, booking);
}
async function createBooking(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '));
        return;
    }
    const { service, eventDate, eventType, venue, guestCount, budget, notes } = req.body;
    const booking = await prisma_1.default.booking.create({
        data: {
            clientId: req.user.userId,
            service,
            eventDate: new Date(eventDate),
            eventType,
            venue,
            guestCount: guestCount ? Number(guestCount) : undefined,
            budget: budget ? Number(budget) : undefined,
            notes,
        },
    });
    // Notificación por email
    const user = await prisma_1.default.user.findUnique({ where: { id: req.user.userId } });
    if (user) {
        (0, email_1.sendBookingConfirmation)({
            to: user.email,
            name: user.name,
            service,
            eventDate: new Date(eventDate).toLocaleDateString('es-MX'),
            bookingId: booking.id,
        }).catch(console.error);
    }
    if (user) {
        (0, activityLogger_1.logActivity)({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            action: 'BOOKING_CREATED',
            detail: `Nueva reserva: ${service} — ${eventType}`,
        });
    }
    R.created(res, booking, 'Reserva creada. Te contactaremos para confirmar los detalles.');
}
async function cancelBooking(req, res) {
    const booking = await prisma_1.default.booking.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!booking) {
        R.notFound(res, 'Reserva no encontrada');
        return;
    }
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
        R.badRequest(res, 'Esta reserva no se puede cancelar');
        return;
    }
    const updated = await prisma_1.default.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
    });
    const cancelUser = await prisma_1.default.user.findUnique({ where: { id: req.user.userId }, select: { name: true, email: true } });
    if (cancelUser) {
        (0, activityLogger_1.logActivity)({
            userId: req.user.userId,
            userName: cancelUser.name,
            userEmail: cancelUser.email,
            action: 'BOOKING_CANCELLED',
            detail: `Reserva cancelada: ${booking.service} — ${booking.eventType}`,
        });
    }
    R.success(res, updated, 'Reserva cancelada');
}
// ─── INVITACIONES DIGITALES DEL CLIENTE ───────────────────────────────────────
async function getMyInvitations(req, res) {
    const invitations = await prisma_1.default.digitalInvitation.findMany({
        where: { clientId: req.user.userId, archivedAt: null },
        orderBy: { createdAt: 'desc' },
    });
    const normalized = invitations.map(normalizeInvitation);
    const withStats = await appendGuestStats(normalized);
    R.success(res, withStats);
}
async function getMyInvitationHistory(req, res) {
    const invitations = await prisma_1.default.digitalInvitation.findMany({
        where: { clientId: req.user.userId, archivedAt: { not: null } },
        orderBy: { archivedAt: 'desc' },
    });
    const normalized = invitations.map(normalizeInvitation);
    const withStats = await appendGuestStats(normalized);
    R.success(res, withStats);
}
async function getMyInvitation(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const [withStats] = await appendGuestStats([normalizeInvitation(invitation)]);
    R.success(res, withStats);
}
async function createInvitation(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '));
        return;
    }
    const { invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote, message, quote, hashtag, template, primaryColor, textColor, fontStyle, isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery, isPublished, rsvpDeadline, guestGreeting, defaultGuestName, } = req.body;
    const shareToken = (0, uuid_1.v4)();
    const resolvedRsvp = rsvpValue || rsvpContact;
    const invitation = await prisma_1.default.digitalInvitation.create({
        data: {
            invitationType: invitationType || 'general',
            clientId: req.user.userId,
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
    });
    const invUser = await prisma_1.default.user.findUnique({ where: { id: req.user.userId }, select: { name: true, email: true } });
    if (invUser) {
        (0, activityLogger_1.logActivity)({
            userId: req.user.userId,
            userName: invUser.name,
            userEmail: invUser.email,
            action: 'INVITATION_CREATED',
            detail: `Nueva invitación: ${title} (${eventType})`,
        });
    }
    R.created(res, normalizeInvitation(invitation), 'Invitación creada exitosamente');
}
async function updateInvitation(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const { invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote, message, quote, hashtag, template, primaryColor, textColor, fontStyle, isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery, isPublished, rsvpDeadline, guestGreeting, defaultGuestName, } = req.body;
    // rsvpContact is a legacy alias — map it to rsvpValue, never send to Prisma directly
    const resolvedRsvpValue = rsvpValue || rsvpContact || undefined;
    const payload = {
        invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote,
        message, quote, hashtag, template, primaryColor, textColor, fontStyle,
        isDark, dressCode, rsvpLabel, rsvpValue: resolvedRsvpValue, heroImage,
        isPublished, guestGreeting, defaultGuestName,
    };
    if (gallery !== undefined) {
        payload.gallery = serializeGallery(gallery);
    }
    if (rsvpDeadline !== undefined) {
        payload.rsvpDeadline = rsvpDeadline ? new Date(rsvpDeadline) : null;
    }
    // Limpiar campos undefined para evitar errores de Prisma
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    const invitation = await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: payload,
    });
    R.success(res, normalizeInvitation(invitation), 'Invitación actualizada');
}
async function deleteInvitation(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: {
            archivedAt: new Date(),
            archiveReason: MANUAL_ARCHIVE_REASON,
            isPublished: false,
        },
    });
    const delUser = await prisma_1.default.user.findUnique({ where: { id: req.user.userId }, select: { name: true, email: true } });
    if (delUser) {
        (0, activityLogger_1.logActivity)({
            userId: req.user.userId,
            userName: delUser.name,
            userEmail: delUser.email,
            action: 'INVITATION_DELETED',
            detail: `Invitación eliminada: ${existing.title}`,
        });
    }
    R.noContent(res);
}
async function toggleInvitationPublished(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const updated = await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: { isPublished: !existing.isPublished },
    });
    R.success(res, normalizeInvitation(updated), `Invitación ${updated.isPublished ? 'publicada' : 'despublicada'}`);
}
// ─── INVITADOS (GUESTS) ────────────────────────────────────────────────────────
async function addGuests(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const { names, guests: guestsInput } = req.body;
    if (guestsInput && Array.isArray(guestsInput)) {
        // Nuevo formato: array de objetos { name, personalizedMessage }
        const created = await Promise.all(guestsInput.map(g => prisma_1.default.invitationGuest.create({
            data: {
                invitationId: invitation.id,
                name: g.name.trim(),
                personalizedMessage: g.personalizedMessage
            }
        })));
        R.created(res, created, 'Invitados agregados');
        return;
    }
    if (!Array.isArray(names) || names.length === 0) {
        R.badRequest(res, 'Se requiere un array de nombres o invitados');
        return;
    }
    const guests = await Promise.all(names
        .map(n => n.trim())
        .filter(Boolean)
        .map(name => prisma_1.default.invitationGuest.create({ data: { invitationId: invitation.id, name } })));
    R.created(res, guests, 'Invitados agregados');
}
async function seedGuestsForDevelopment(req, res) {
    if (process.env.NODE_ENV === 'production') {
        R.forbidden(res, 'Acción no disponible en producción');
        return;
    }
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const now = new Date();
    const testGuests = [
        { name: 'Invitado de prueba 1', response: 'ACCEPTED', respondedAt: now },
        { name: 'Invitado de prueba 2', response: 'ACCEPTED', respondedAt: new Date(now.getTime() - 86400000) },
        { name: 'Invitado de prueba 3', response: 'PENDING' },
        { name: 'Invitado de prueba 4', response: 'PENDING' },
        { name: 'Invitado de prueba 5', response: 'DECLINED', respondedAt: new Date(now.getTime() - 172800000) },
    ];
    const created = await prisma_1.default.$transaction(testGuests.map(guest => prisma_1.default.invitationGuest.create({
        data: {
            invitationId: invitation.id,
            name: guest.name,
            response: guest.response,
            respondedAt: guest.respondedAt,
        },
    })));
    R.created(res, created, 'Se crearon 5 invitados de prueba');
}
async function listGuests(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const guests = await prisma_1.default.invitationGuest.findMany({
        where: { invitationId: invitation.id },
        orderBy: { createdAt: 'asc' },
    });
    R.success(res, guests);
}
async function updateGuest(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const guest = await prisma_1.default.invitationGuest.findFirst({
        where: { id: req.params.gid, invitationId: invitation.id },
    });
    if (!guest) {
        R.notFound(res, 'Invitado no encontrado');
        return;
    }
    const { personalizedMessage } = req.body;
    const updated = await prisma_1.default.invitationGuest.update({
        where: { id: guest.id },
        data: { personalizedMessage: personalizedMessage !== undefined ? (personalizedMessage || null) : undefined },
    });
    R.success(res, updated, 'Mensaje actualizado');
}
async function deleteGuest(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const guest = await prisma_1.default.invitationGuest.findFirst({
        where: { id: req.params.gid, invitationId: invitation.id },
    });
    if (!guest) {
        R.notFound(res, 'Invitado no encontrado');
        return;
    }
    await prisma_1.default.invitationGuest.delete({ where: { id: guest.id } });
    R.noContent(res);
}
// ──────────────────────────────────────────────────────────────────────────────
async function addInvitationPhotos(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const files = (req.files || []);
    const urls = files.map(file => `/uploads/${file.filename}`);
    const current = parseGallery(existing.gallery);
    const updated = await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: { gallery: JSON.stringify([...current, ...urls]) },
    });
    R.success(res, normalizeInvitation(updated), 'Fotos agregadas');
}
async function archiveInvitation(req, res) {
    const { reason } = req.body;
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, clientId: req.user.userId, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const invitation = await archivalService.archiveInvitation(existing.id, reason);
    R.success(res, normalizeInvitation(invitation), 'Invitación archivada');
}
//# sourceMappingURL=clientController.js.map