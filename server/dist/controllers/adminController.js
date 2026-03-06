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
exports.listInvitations = listInvitations;
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
const prisma_1 = __importDefault(require("../utils/prisma"));
const uuid_1 = require("uuid");
const password_1 = require("../utils/password");
const R = __importStar(require("../utils/response"));
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
// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
async function getDashboard(_req, res) {
    const [totalContacts, pendingContacts, totalBookings, pendingBookings, confirmedBookings, totalClients, totalPortfolio, recentContacts, recentBookings,] = await Promise.all([
        prisma_1.default.contactRequest.count(),
        prisma_1.default.contactRequest.count({ where: { status: 'PENDING' } }),
        prisma_1.default.booking.count(),
        prisma_1.default.booking.count({ where: { status: 'PENDING' } }),
        prisma_1.default.booking.count({ where: { status: 'CONFIRMED' } }),
        prisma_1.default.user.count({ where: { role: 'CLIENT' } }),
        prisma_1.default.portfolioItem.count(),
        prisma_1.default.contactRequest.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        }),
        prisma_1.default.booking.findMany({
            take: 5,
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
    const where = {};
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
async function getBooking(req, res) {
    const booking = await prisma_1.default.booking.findUnique({
        where: { id: req.params.id },
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
    const booking = await prisma_1.default.booking.update({
        where: { id: req.params.id },
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
// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
// Invitaciones digitales
async function listInvitations(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma_1.default.digitalInvitation.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { id: true, name: true, email: true } } },
        }),
        prisma_1.default.digitalInvitation.count(),
    ]);
    R.paginate(res, items.map(normalizeInvitation), total, page, limit);
}
async function getInvitation(req, res) {
    const item = await prisma_1.default.digitalInvitation.findUnique({
        where: { id: req.params.id },
        include: { client: { select: { id: true, name: true, email: true } } },
    });
    if (!item) {
        R.notFound(res);
        return;
    }
    R.success(res, normalizeInvitation(item));
}
async function createInvitation(req, res) {
    const { clientId, eventType, title, names, eventDate, eventTime, venue, locationNote, message, quote, hashtag, template, primaryColor, textColor, fontStyle, isDark, dressCode, rsvpLabel, rsvpValue, gallery, isPublished, rsvpDeadline, } = req.body;
    const shareToken = (0, uuid_1.v4)();
    const invitation = await prisma_1.default.digitalInvitation.create({
        data: {
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
            rsvpValue,
            rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : undefined,
            gallery: serializeGallery(gallery),
            shareToken,
        },
    });
    R.created(res, normalizeInvitation(invitation));
}
async function updateInvitation(req, res) {
    const payload = { ...req.body };
    if (payload.gallery) {
        payload.gallery = serializeGallery(payload.gallery);
    }
    const invitation = await prisma_1.default.digitalInvitation.update({
        where: { id: req.params.id },
        data: payload,
    });
    R.success(res, normalizeInvitation(invitation));
}
async function deleteInvitation(req, res) {
    await prisma_1.default.digitalInvitation.delete({ where: { id: req.params.id } });
    R.noContent(res);
}
async function toggleInvitationPublished(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findUnique({ where: { id: req.params.id } });
    if (!existing) {
        R.notFound(res);
        return;
    }
    const updated = await prisma_1.default.digitalInvitation.update({
        where: { id: req.params.id },
        data: { isPublished: !existing.isPublished },
    });
    R.success(res, normalizeInvitation(updated));
}
async function addInvitationPhotos(req, res) {
    const existing = await prisma_1.default.digitalInvitation.findUnique({ where: { id: req.params.id } });
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
    const invitation = await prisma_1.default.digitalInvitation.findUnique({ where: { id: req.params.id } });
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
    const invitation = await prisma_1.default.digitalInvitation.findUnique({ where: { id: req.params.id } });
    if (!invitation) {
        R.notFound(res, 'Invitacion no encontrada');
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
    const invitation = await prisma_1.default.digitalInvitation.findUnique({ where: { id: req.params.id } });
    if (!invitation) {
        R.notFound(res, 'Invitacion no encontrada');
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
//# sourceMappingURL=adminController.js.map