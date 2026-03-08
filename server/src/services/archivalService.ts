import prisma from '../utils/prisma';

/**
 * Archives a booking by setting the archivedAt timestamp and reason.
 */
export async function archiveBooking(id: string, reason?: string) {
  return await prisma.booking.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      archiveReason: reason || 'Manual archive',
    },
  });
}

/**
 * Archives a digital invitation by setting the archivedAt timestamp and reason.
 */
export async function archiveInvitation(id: string, reason?: string) {
  return await prisma.digitalInvitation.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      archiveReason: reason || 'Manual archive',
    },
  });
}

/**
 * Unarchives a booking by clearing the archivedAt timestamp and reason.
 */
export async function unarchiveBooking(id: string) {
  return await prisma.booking.update({
    where: { id },
    data: {
      archivedAt: null,
      archiveReason: null,
    },
  });
}

/**
 * Unarchives a digital invitation by clearing the archivedAt timestamp and reason.
 */
export async function unarchiveInvitation(id: string) {
  return await prisma.digitalInvitation.update({
    where: { id },
    data: {
      archivedAt: null,
      archiveReason: null,
    },
  });
}

/**
 * Retrieves all archived bookings.
 */
export async function getArchivedBookings() {
  return await prisma.booking.findMany({
    where: {
      archivedAt: { not: null },
    },
    include: {
      client: {
        select: {
          id: true,
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

/**
 * Retrieves all archived invitations.
 */
export async function getArchivedInvitations() {
  return await prisma.digitalInvitation.findMany({
    where: {
      archivedAt: { not: null },
    },
    include: {
      client: {
        select: {
          id: true,
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

// ─── AUTOMATIC ARCHIVAL WORKFLOW ─────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BOOKING_DAYS = 180;
const DEFAULT_INVITATION_DAYS = 365;
const DEFAULT_INTERVAL_MINUTES = 60;
const AUTO_REASON = 'AUTO_RETENTION';

async function runArchivalSweep() {
  const now = new Date();
  const bookingCutoff = new Date(now.getTime() - DEFAULT_BOOKING_DAYS * DAY_MS);
  const invitationCutoff = new Date(now.getTime() - DEFAULT_INVITATION_DAYS * DAY_MS);

  try {
    // Archive old bookings
    const bookings = await prisma.booking.updateMany({
      where: {
        eventDate: { lt: bookingCutoff },
        archivedAt: null,
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
      data: {
        archivedAt: now,
        archiveReason: AUTO_REASON,
      },
    });

    // Archive old invitations
    const invitations = await prisma.digitalInvitation.updateMany({
      where: {
        createdAt: { lt: invitationCutoff },
        archivedAt: null,
      },
      data: {
        archivedAt: now,
        archiveReason: AUTO_REASON,
      },
    });

    if (bookings.count > 0 || invitations.count > 0) {
      console.log(`[archival] Barrido completado: ${bookings.count} reservas y ${invitations.count} invitaciones archivadas.`);
    }
  } catch (error) {
    console.error('[archival] Error durante el barrido:', error);
  }
}

export function startArchivalWorkflow(intervalMs = DEFAULT_INTERVAL_MINUTES * 60 * 1000) {
  console.log('[archival] Iniciando flujo de archivado automático...');
  
  // Run first sweep after a small delay
  setTimeout(() => {
    void runArchivalSweep().catch(e => console.error('[archival] Initial sweep failed:', e));
  }, 5000);

  const timer = setInterval(() => {
    void runArchivalSweep().catch((error) => {
      console.error('[archival] Error en barrido programado:', error);
    });
  }, intervalMs);

  return () => clearInterval(timer);
}
