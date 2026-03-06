import prisma from '../utils/prisma'

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_BOOKING_DAYS = 180
const DEFAULT_INVITATION_DAYS = 365
const DEFAULT_INTERVAL_MINUTES = 60
const AUTO_REASON = 'AUTO_RETENTION'

interface InvitationReferenceCandidate {
  id: string
  eventDate: string
  rsvpDeadline: Date | null
  createdAt: Date
}

function readPositiveInt(envName: string, fallback: number): number {
  const raw = process.env[envName]
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.floor(parsed)
}

function parseLooseDate(value?: string | null): Date | null {
  if (!value) return null
  const direct = new Date(value)
  if (!Number.isNaN(direct.getTime())) return direct

  const normalized = value.trim()
  const dmy = normalized.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2]) - 1
    const year = Number(dmy[3])
    const parsed = new Date(year, month, day)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const ymd = normalized.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/)
  if (ymd) {
    const year = Number(ymd[1])
    const month = Number(ymd[2]) - 1
    const day = Number(ymd[3])
    const parsed = new Date(year, month, day)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  return null
}

function invitationReferenceDate(inv: InvitationReferenceCandidate): Date {
  if (inv.rsvpDeadline) return inv.rsvpDeadline
  const fromEventDate = parseLooseDate(inv.eventDate)
  if (fromEventDate) return fromEventDate
  return inv.createdAt
}

export async function runArchivalSweep(now = new Date()): Promise<{
  archivedBookings: number
  archivedInvitations: number
}> {
  const bookingDays = readPositiveInt('BOOKING_ARCHIVE_AFTER_DAYS', DEFAULT_BOOKING_DAYS)
  const invitationDays = readPositiveInt('INVITATION_ARCHIVE_AFTER_DAYS', DEFAULT_INVITATION_DAYS)

  const bookingCutoff = new Date(now.getTime() - bookingDays * DAY_MS)
  const invitationCutoff = new Date(now.getTime() - invitationDays * DAY_MS)

  const bookingResult = await prisma.booking.updateMany({
    where: {
      archivedAt: null,
      eventDate: { lte: bookingCutoff },
    },
    data: {
      archivedAt: now,
      archiveReason: AUTO_REASON,
    },
  })

  const activeInvitations = await prisma.digitalInvitation.findMany({
    where: { archivedAt: null },
    select: { id: true, eventDate: true, rsvpDeadline: true, createdAt: true },
  })

  const invitationIdsToArchive = activeInvitations
    .filter(inv => invitationReferenceDate(inv) <= invitationCutoff)
    .map(inv => inv.id)

  let archivedInvitations = 0
  if (invitationIdsToArchive.length > 0) {
    const invitationResult = await prisma.digitalInvitation.updateMany({
      where: { id: { in: invitationIdsToArchive } },
      data: {
        archivedAt: now,
        archiveReason: AUTO_REASON,
      },
    })
    archivedInvitations = invitationResult.count
  }

  if (bookingResult.count > 0 || archivedInvitations > 0) {
    console.log(
      `[archival] Barrido completado: ${bookingResult.count} reservas archivadas, ${archivedInvitations} invitaciones archivadas`
    )
  }

  return {
    archivedBookings: bookingResult.count,
    archivedInvitations,
  }
}

export function startArchivalWorkflow(): () => void {
  const intervalMinutes = readPositiveInt('ARCHIVE_SWEEP_INTERVAL_MINUTES', DEFAULT_INTERVAL_MINUTES)
  const intervalMs = intervalMinutes * 60 * 1000

  // First run at startup
  void runArchivalSweep().catch((error) => {
    console.error('[archival] Error en barrido inicial:', error)
  })

  const timer = setInterval(() => {
    void runArchivalSweep().catch((error) => {
      console.error('[archival] Error en barrido programado:', error)
    })
  }, intervalMs)

  return () => clearInterval(timer)
}
