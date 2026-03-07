"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveBooking = archiveBooking;
exports.archiveInvitation = archiveInvitation;
exports.unarchiveBooking = unarchiveBooking;
exports.unarchiveInvitation = unarchiveInvitation;
exports.getArchivedBookings = getArchivedBookings;
exports.getArchivedInvitations = getArchivedInvitations;
const prisma_1 = __importDefault(require("../utils/prisma"));
async function archiveBooking(id, reason) {
    return prisma_1.default.booking.update({
        where: { id },
        data: {
            archivedAt: new Date(),
            archiveReason: reason || 'Manual archive',
        },
    });
}
async function archiveInvitation(id, reason) {
    return prisma_1.default.digitalInvitation.update({
        where: { id },
        data: {
            archivedAt: new Date(),
            archiveReason: reason || 'Manual archive',
        },
    });
}
async function unarchiveBooking(id) {
    return prisma_1.default.booking.update({
        where: { id },
        data: {
            archivedAt: null,
            archiveReason: null,
        },
    });
}
async function unarchiveInvitation(id) {
    return prisma_1.default.digitalInvitation.update({
        where: { id },
        data: {
            archivedAt: null,
            archiveReason: null,
        },
    });
}
async function getArchivedBookings() {
    return prisma_1.default.booking.findMany({
        where: {
            archivedAt: { not: null },
        },
        include: {
            client: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            archivedAt: 'desc',
        },
    });
}
async function getArchivedInvitations() {
    return prisma_1.default.digitalInvitation.findMany({
        where: {
            archivedAt: { not: null },
        },
        include: {
            client: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            archivedAt: 'desc',
        },
    });
}
//# sourceMappingURL=archivalService.js.map