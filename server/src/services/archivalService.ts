import prisma from '../utils/prisma'

export async function archiveBooking(id: string, reason?: string) {
  return prisma.booking.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      archiveReason: reason || 'Manual archive',
    },
  })
}

export async function archiveInvitation(id: string, reason?: string) {
  return prisma.digitalInvitation.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      archiveReason: reason || 'Manual archive',
    },
  })
}

export async function unarchiveBooking(id: string) {
  return prisma.booking.update({
    where: { id },
    data: {
      archivedAt: null,
      archiveReason: null,
    },
  })
}

export async function unarchiveInvitation(id: string) {
  return prisma.digitalInvitation.update({
    where: { id },
    data: {
      archivedAt: null,
      archiveReason: null,
    },
  })
}

export async function getArchivedBookings() {
  return prisma.booking.findMany({
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
  })
}

export async function getArchivedInvitations() {
  return prisma.digitalInvitation.findMany({
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
  })
}
