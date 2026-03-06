"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArchivalSweep = runArchivalSweep;
exports.startArchivalWorkflow = startArchivalWorkflow;
const prisma_1 = __importDefault(require("../utils/prisma"));
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BOOKING_DAYS = 180;
const DEFAULT_INVITATION_DAYS = 365;
const DEFAULT_INTERVAL_MINUTES = 60;
const AUTO_REASON = 'AUTO_RETENTION';
function readPositiveInt(envName, fallback) {
    const raw = process.env[envName];
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return fallback;
    return Math.floor(parsed);
}
function parseLooseDate(value) {
    if (!value)
        return null;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime()))
        return direct;
    const normalized = value.trim();
    const dmy = normalized.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (dmy) {
        const day = Number(dmy[1]);
        const month = Number(dmy[2]) - 1;
        const year = Number(dmy[3]);
        const parsed = new Date(year, month, day);
        if (!Number.isNaN(parsed.getTime()))
            return parsed;
    }
    const ymd = normalized.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
    if (ymd) {
        const year = Number(ymd[1]);
        const month = Number(ymd[2]) - 1;
        const day = Number(ymd[3]);
        const parsed = new Date(year, month, day);
        if (!Number.isNaN(parsed.getTime()))
            return parsed;
    }
    return null;
}
function invitationReferenceDate(inv) {
    if (inv.rsvpDeadline)
        return inv.rsvpDeadline;
    const fromEventDate = parseLooseDate(inv.eventDate);
    if (fromEventDate)
        return fromEventDate;
    return inv.createdAt;
}
async function runArchivalSweep(now = new Date()) {
    const bookingDays = readPositiveInt('BOOKING_ARCHIVE_AFTER_DAYS', DEFAULT_BOOKING_DAYS);
    const invitationDays = readPositiveInt('INVITATION_ARCHIVE_AFTER_DAYS', DEFAULT_INVITATION_DAYS);
    const bookingCutoff = new Date(now.getTime() - bookingDays * DAY_MS);
    const invitationCutoff = new Date(now.getTime() - invitationDays * DAY_MS);
    const bookingResult = await prisma_1.default.booking.updateMany({
        where: {
            archivedAt: null,
            eventDate: { lte: bookingCutoff },
        },
        data: {
            archivedAt: now,
            archiveReason: AUTO_REASON,
        },
    });
    const activeInvitations = await prisma_1.default.digitalInvitation.findMany({
        where: { archivedAt: null },
        select: { id: true, eventDate: true, rsvpDeadline: true, createdAt: true },
    });
    const invitationIdsToArchive = activeInvitations
        .filter(inv => invitationReferenceDate(inv) <= invitationCutoff)
        .map(inv => inv.id);
    let archivedInvitations = 0;
    if (invitationIdsToArchive.length > 0) {
        const invitationResult = await prisma_1.default.digitalInvitation.updateMany({
            where: { id: { in: invitationIdsToArchive } },
            data: {
                archivedAt: now,
                archiveReason: AUTO_REASON,
            },
        });
        archivedInvitations = invitationResult.count;
    }
    if (bookingResult.count > 0 || archivedInvitations > 0) {
        console.log(`[archival] Barrido completado: ${bookingResult.count} reservas archivadas, ${archivedInvitations} invitaciones archivadas`);
    }
    return {
        archivedBookings: bookingResult.count,
        archivedInvitations,
    };
}
function startArchivalWorkflow() {
    const intervalMinutes = readPositiveInt('ARCHIVE_SWEEP_INTERVAL_MINUTES', DEFAULT_INTERVAL_MINUTES);
    const intervalMs = intervalMinutes * 60 * 1000;
    // First run at startup
    void runArchivalSweep().catch((error) => {
        console.error('[archival] Error en barrido inicial:', error);
    });
    const timer = setInterval(() => {
        void runArchivalSweep().catch((error) => {
            console.error('[archival] Error en barrido programado:', error);
        });
    }, intervalMs);
    return () => clearInterval(timer);
}
//# sourceMappingURL=archivalService.js.map