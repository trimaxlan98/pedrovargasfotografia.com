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
exports.getDashboard = getDashboard;
exports.listContacts = listContacts;
exports.getContact = getContact;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
exports.listBookings = listBookings;
exports.listBookingHistory = listBookingHistory;
exports.getBooking = getBooking;
exports.updateBooking = updateBooking;
exports.listPortfolio = listPortfolio;
exports.createPortfolioItem = createPortfolioItem;
exports.updatePortfolioItem = updatePortfolioItem;
exports.deletePortfolioItem = deletePortfolioItem;
exports.listTestimonials = listTestimonials;
exports.createTestimonial = createTestimonial;
exports.updateTestimonial = updateTestimonial;
exports.deleteTestimonial = deleteTestimonial;
exports.listServices = listServices;
exports.updateService = updateService;
exports.listClients = listClients;
exports.createClient = createClient;
exports.toggleClientStatus = toggleClientStatus;
exports.listAccounts = listAccounts;
exports.createAccount = createAccount;
exports.toggleAccountStatus = toggleAccountStatus;
exports.listInvitations = listInvitations;
exports.listInvitationHistory = listInvitationHistory;
exports.getInvitation = getInvitation;
exports.createInvitation = createInvitation;
exports.updateInvitation = updateInvitation;
exports.deleteInvitation = deleteInvitation;
exports.toggleInvitationPublished = toggleInvitationPublished;
exports.addInvitationPhotos = addInvitationPhotos;
exports.listGuestsByInvitation = listGuestsByInvitation;
exports.addGuestsByInvitation = addGuestsByInvitation;
exports.deleteGuestByInvitation = deleteGuestByInvitation;
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.archiveBooking = archiveBooking;
exports.unarchiveBooking = unarchiveBooking;
exports.getArchivedBookings = getArchivedBookings;
exports.archiveInvitation = archiveInvitation;
exports.unarchiveInvitation = unarchiveInvitation;
exports.getArchivedInvitations = getArchivedInvitations;
const prisma_1 = __importDefault(require("../utils/prisma"));
const uuid_1 = require("uuid");
const password_1 = require("../utils/password");
const R = __importStar(require("../utils/response"));
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
const MANUAL_ARCHIVE_REASON = 'MANUAL_DELETE';
// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
async function getDashboard(_req, res) {
    const [totalContacts, pendingContacts, totalBookings, pendingBookings, confirmedBookings, totalClients, totalPortfolio, recentContacts, recentBookings,] = await Promise.all([
        prisma_1.default.contactRequest.count(),
        prisma_1.default.contactRequest.count({ where: { status: 'PENDING' } }),
        prisma_1.default.booking.count({ where: { archivedAt: null } }),
        prisma_1.default.booking.count({ where: { status: 'PENDING', archivedAt: null } }),
        prisma_1.default.booking.count({ where: { status: 'CONFIRMED', archivedAt: null } }),
        prisma_1.default.user.count({ where: { role: 'CLIENT' } }),
        prisma_1.default.portfolioItem.count(),
        prisma_1.default.contactRequest.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.default.booking.findMany({
            take: 5,
            where: { archivedAt: null },
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { name: true, email: true } } },
        }),
    ]);
    R.success(res, {
        stats: { totalContacts, pendingContacts, totalBookings, pendingBookings, confirmedBookings, totalClients, totalPortfolio },
        recentContacts,
        recentBookings,
    });
}
// ─── SOLICITUDES DE CONTACTO ───────────────────────────────────────────────────
async function listContacts(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const where = {};
    if (status)
        where.status = status;
    const [contacts, total] = await Promise.all([
        prisma_1.default.contactRequest.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma_1.default.contactRequest.count({ where }),
    ]);
    R.paginate(res, contacts, total, page, limit);
}
async function getContact(req, res) {
    const contact = await prisma_1.default.contactRequest.findUnique({ where: { id: req.params.id } });
    if (!contact) {
        R.notFound(res);
        return;
    }
    R.success(res, contact);
}
async function updateContact(req, res) {
    const { status, notes } = req.body;
    const contact = await prisma_1.default.contactRequest.update({
        where: { id: req.params.id },
        data: { status, notes },
    });
    R.success(res, contact, 'Solicitud actualizada');
}
async function deleteContact(req, res) {
    await prisma_1.default.contactRequest.delete({ where: { id: req.params.id } });
    R.noContent(res);
}
// ─── RESERVAS ──────────────────────────────────────────────────────────────────
async function listBookings(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const where = { archivedAt: null };
    if (status)
        where.status = status;
    const [bookings, total] = await Promise.all([
        prisma_1.default.booking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { id: true, name: true, email: true, phone: true } } },
        }),
        prisma_1.default.booking.count({ where }),
    ]);
    R.paginate(res, bookings, total, page, limit);
}
async function listBookingHistory(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const where = { archivedAt: { not: null } };
    if (status)
        where.status = status;
    const [bookings, total] = await Promise.all([
        prisma_1.default.booking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { archivedAt: 'desc' },
            include: { client: { select: { id: true, name: true, email: true, phone: true } } },
        }),
        prisma_1.default.booking.count({ where }),
    ]);
    R.paginate(res, bookings, total, page, limit);
}
async function getBooking(req, res) {
    const booking = await prisma_1.default.booking.findFirst({
        where: { id: req.params.id, archivedAt: null },
        include: { client: { select: { id: true, name: true, email: true, phone: true } } },
    });
    if (!booking) {
        R.notFound(res);
        return;
    }
    R.success(res, booking);
}
async function updateBooking(req, res) {
    const { status, adminNotes, totalPrice, depositPaid } = req.body;
    const existing = await prisma_1.default.booking.findFirst({
        where: { id: req.params.id, archivedAt: null },
        select: { id: true },
    });
    if (!existing) {
        R.notFound(res, 'Reserva no encontrada');
        return;
    }
    const booking = await prisma_1.default.booking.update({
        where: { id: existing.id },
        data: { status, adminNotes, totalPrice, depositPaid },
    });
    R.success(res, booking, 'Reserva actualizada');
}
// ─── PORTFOLIO ─────────────────────────────────────────────────────────────────
async function listPortfolio(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma_1.default.portfolioItem.findMany({ skip, take: limit, orderBy: { order: 'asc' } }),
        prisma_1.default.portfolioItem.count(),
    ]);
    R.paginate(res, items, total, page, limit);
}
async function createPortfolioItem(req, res) {
    const { title, category, description, eventDate, location, featured, order } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    if (!imageUrl) {
        R.badRequest(res, 'La imagen es requerida');
        return;
    }
    const item = await prisma_1.default.portfolioItem.create({
        data: { title, category, imageUrl, description, eventDate, location, featured: featured === 'true', order: Number(order) || 0 },
    });
    R.created(res, item, 'Item de portfolio creado');
}
async function updatePortfolioItem(req, res) {
    const { title, category, description, eventDate, location, featured, order, isVisible } = req.body;
    const data = { title, category, description, eventDate, location };
    if (featured !== undefined)
        data.featured = featured === 'true' || featured === true;
    if (isVisible !== undefined)
        data.isVisible = isVisible === 'true' || isVisible === true;
    if (order !== undefined)
        data.order = Number(order);
    if (req.file)
        data.imageUrl = `/uploads/${req.file.filename}`;
    const item = await prisma_1.default.portfolioItem.update({ where: { id: req.params.id }, data });
    R.success(res, item, 'Item actualizado');
}
async function deletePortfolioItem(req, res) {
    await prisma_1.default.portfolioItem.delete({ where: { id: req.params.id } });
    R.noContent(res);
}
// ─── TESTIMONIOS ───────────────────────────────────────────────────────────────
async function listTestimonials(_req, res) {
    const items = await prisma_1.default.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    R.success(res, items);
}
async function createTestimonial(req, res) {
    const item = await prisma_1.default.testimonial.create({ data: req.body });
    R.created(res, item);
}
async function updateTestimonial(req, res) {
    const item = await prisma_1.default.testimonial.update({ where: { id: req.params.id }, data: req.body });
    R.success(res, item, 'Testimonio actualizado');
}
async function deleteTestimonial(req, res) {
    await prisma_1.default.testimonial.delete({ where: { id: req.params.id } });
    R.noContent(res);
}
// ─── SERVICIOS ─────────────────────────────────────────────────────────────────
async function listServices(_req, res) {
    const items = await prisma_1.default.service.findMany({ orderBy: { order: 'asc' } });
    R.success(res, items);
}
async function updateService(req, res) {
    const { features, ...rest } = req.body;
    const data = { ...rest };
    if (features)
        data.features = Array.isArray(features) ? JSON.stringify(features) : features;
    const item = await prisma_1.default.service.update({ where: { id: req.params.id }, data });
    R.success(res, { ...item, features: JSON.parse(item.features || '[]') }, 'Servicio actualizado');
}
// ─── CLIENTES ──────────────────────────────────────────────────────────────────
async function listClients(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const where = { role: 'CLIENT' };
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    const [clients, total] = await Promise.all([
        prisma_1.default.user.findMany({
            where,
            skip,
            take: limit,
            select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.default.user.count({ where }),
    ]);
    R.paginate(res, clients, total, page, limit);
}
async function createClient(req, res) {
    const { name, email, phone, password } = req.body;
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing) {
        R.conflict(res, 'Ya existe una cuenta con ese correo');
        return;
    }
    const hashed = await (0, password_1.hashPassword)(password || 'Cliente123!');
    const client = await prisma_1.default.user.create({
        data: { name, email, phone, password: hashed, role: 'CLIENT' },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    R.created(res, client, 'Cliente creado exitosamente');
}
async function toggleClientStatus(req, res) {
    const user = await prisma_1.default.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
        R.notFound(res);
        return;
    }
    const updated = await prisma_1.default.user.update({
        where: { id: req.params.id },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, email: true, isActive: true },
    });
    R.success(res, updated, `Cliente ${updated.isActive ? 'activado' : 'desactivado'}`);
}
async function listAccounts(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const role = req.query.role;
    const where = {};
    if (role && ['ADMIN', 'CLIENT'].includes(role)) {
        where.role = role;
    }
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    const [accounts, total] = await Promise.all([
        prisma_1.default.user.findMany({
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
        prisma_1.default.user.count({ where }),
    ]);
    R.paginate(res, accounts, total, page, limit);
}
async function createAccount(req, res) {
    const { name, email, phone, password, role } = req.body;
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        R.badRequest(res, 'Nombre, correo y contraseña son obligatorios');
        return;
    }
    const cleanRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (cleanPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(cleanPassword)) {
        R.badRequest(res, 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula y número');
        return;
    }
    const existing = await prisma_1.default.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
        R.conflict(res, 'Ya existe una cuenta con ese correo');
        return;
    }
    const hashed = await (0, password_1.hashPassword)(cleanPassword);
    const account = await prisma_1.default.user.create({
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
    });
    R.created(res, account, 'Cuenta creada exitosamente');
}
async function toggleAccountStatus(req, res) {
    const account = await prisma_1.default.user.findUnique({
        where: { id: req.params.id },
        select: { id: true, name: true, role: true, isActive: true },
    });
    if (!account) {
        R.notFound(res, 'Cuenta no encontrada');
        return;
    }
    if (account.id === req.user?.userId && account.isActive) {
        R.badRequest(res, 'No puedes desactivar tu propia cuenta');
        return;
    }
    const updated = await prisma_1.default.user.update({
        where: { id: account.id },
        data: { isActive: !account.isActive },
        select: { id: true, name: true, role: true, isActive: true },
    });
    R.success(res, updated, `Cuenta ${updated.isActive ? 'activada' : 'desactivada'}`);
}
// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
// Invitaciones digitales
async function listInvitations(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma_1.default.digitalInvitation.findMany({
            where: { archivedAt: null },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { id: true, name: true, email: true } } },
        }),
        prisma_1.default.digitalInvitation.count({ where: { archivedAt: null } }),
    ]);
    const withStats = await appendGuestStats(items.map(normalizeInvitation));
    R.paginate(res, withStats, total, page, limit);
}
async function listInvitationHistory(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma_1.default.digitalInvitation.findMany({
            where: { archivedAt: { not: null } },
            skip,
            take: limit,
            orderBy: { archivedAt: 'desc' },
            include: { client: { select: { id: true, name: true, email: true } } },
        }),
        prisma_1.default.digitalInvitation.count({ where: { archivedAt: { not: null } } }),
    ]);
    const withStats = await appendGuestStats(items.map(normalizeInvitation));
    R.paginate(res, withStats, total, page, limit);
}
async function getInvitation(req, res) {
    const item = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
        include: { client: { select: { id: true, name: true, email: true } } },
    });
    if (!item) {
        R.notFound(res);
        return;
    }
    const [withStats] = await appendGuestStats([normalizeInvitation(item)]);
    R.success(res, withStats);
}
async function createInvitation(req, res) {
    const { clientId, invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote, message, quote, hashtag, template, primaryColor, textColor, fontStyle, isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery, isPublished, rsvpDeadline, guestGreeting, defaultGuestName, } = req.body;
    if (!clientId) {
        R.badRequest(res, 'Se requiere clientId');
        return;
    }
    const clientExists = await prisma_1.default.user.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!clientExists) {
        R.notFound(res, 'Cliente no encontrado');
        return;
    }
    const resolvedRsvp = rsvpValue || rsvpContact;
    const shareToken = (0, uuid_1.v4)();
    const invitation = await prisma_1.default.digitalInvitation.create({
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
    });
    R.created(res, normalizeInvitation(invitation));
}
async function updateInvitation(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
        select: { id: true },
    });
    if (!existing) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const { invitationType, eventType, title, names, eventDate, eventTime, venue, locationNote, message, quote, hashtag, template, primaryColor, textColor, fontStyle, isDark, dressCode, rsvpLabel, rsvpValue, rsvpContact, heroImage, gallery, isPublished, rsvpDeadline, guestGreeting, defaultGuestName, } = req.body;
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
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    const invitation = await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: payload,
    });
    R.success(res, normalizeInvitation(invitation));
}
async function deleteInvitation(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
        select: { id: true },
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
    R.noContent(res);
}
async function toggleInvitationPublished(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res);
        return;
    }
    const updated = await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: { isPublished: !existing.isPublished },
    });
    R.success(res, normalizeInvitation(updated));
}
async function addInvitationPhotos(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
    });
    if (!existing) {
        R.notFound(res);
        return;
    }
    const files = (req.files || []);
    const urls = files.map(file => `/uploads/${file.filename}`);
    const current = parseGallery(existing.gallery);
    const updated = await prisma_1.default.digitalInvitation.update({
        where: { id: existing.id },
        data: { gallery: JSON.stringify([...current, ...urls]) },
    });
    R.success(res, normalizeInvitation(updated));
}
async function listGuestsByInvitation(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
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
async function addGuestsByInvitation(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
    });
    if (!invitation) {
        R.notFound(res, 'Invitación no encontrada');
        return;
    }
    const { names } = req.body;
    if (!Array.isArray(names) || names.length === 0) {
        R.badRequest(res, 'Se requiere un array de nombres');
        return;
    }
    const guests = await Promise.all(names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => prisma_1.default.invitationGuest.create({ data: { invitationId: invitation.id, name } })));
    R.created(res, guests, 'Invitados agregados');
}
async function deleteGuestByInvitation(req, res) {
    const invitation = await prisma_1.default.digitalInvitation.findFirst({
        where: { id: req.params.id, archivedAt: null },
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
async function getSettings(_req, res) {
    const settings = await prisma_1.default.siteSettings.upsert({
        where: { id: 'main' },
        update: {},
        create: { id: 'main' },
    });
    R.success(res, settings);
}
async function updateSettings(req, res) {
    const settings = await prisma_1.default.siteSettings.upsert({
        where: { id: 'main' },
        update: req.body,
        create: { id: 'main', ...req.body },
    });
    R.success(res, settings, 'Configuración actualizada');
}
// ─── ARCHIVADO ────────────────────────────────────────────────────────────────
async function archiveBooking(req, res) {
    const { reason } = req.body;
    const booking = await archivalService.archiveBooking(req.params.id, reason);
    R.success(res, booking, 'Reserva archivada');
}
async function unarchiveBooking(req, res) {
    const booking = await archivalService.unarchiveBooking(req.params.id);
    R.success(res, booking, 'Reserva restaurada');
}
async function getArchivedBookings(_req, res) {
    const bookings = await archivalService.getArchivedBookings();
    R.success(res, bookings);
}
async function archiveInvitation(req, res) {
    const { reason } = req.body;
    const invitation = await archivalService.archiveInvitation(req.params.id, reason);
    R.success(res, normalizeInvitation(invitation), 'Invitación archivada');
}
async function unarchiveInvitation(req, res) {
    const invitation = await archivalService.unarchiveInvitation(req.params.id);
    R.success(res, normalizeInvitation(invitation), 'Invitación restaurada');
}
async function getArchivedInvitations(_req, res) {
    const invitations = await archivalService.getArchivedInvitations();
    R.success(res, invitations.map(normalizeInvitation));
}
//# sourceMappingURL=adminController.js.map