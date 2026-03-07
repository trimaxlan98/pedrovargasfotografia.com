import { Response } from 'express'
import prisma from '../utils/prisma'
import { AuthRequest } from '../types'
import * as R from '../utils/response'

// GET /api/admin/notifications
export async function listNotifications(req: AuthRequest, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 60, 200)
  const unreadOnly = req.query.unreadOnly === 'true'

  const [logs, unreadCount] = await Promise.all([
    prisma.activityLog.findMany({
      where: unreadOnly ? { isRead: false } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.activityLog.count({ where: { isRead: false } }),
  ])

  R.success(res, { logs, unreadCount })
}

// PATCH /api/admin/notifications/mark-all-read
export async function markAllRead(_req: AuthRequest, res: Response): Promise<void> {
  await prisma.activityLog.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  })
  R.success(res, null, 'Todas las notificaciones marcadas como leídas')
}

// PATCH /api/admin/notifications/:id/read
export async function markRead(req: AuthRequest, res: Response): Promise<void> {
  const log = await prisma.activityLog.findUnique({ where: { id: req.params.id } })
  if (!log) { R.notFound(res, 'Notificación no encontrada'); return }

  await prisma.activityLog.update({
    where: { id: req.params.id },
    data: { isRead: true },
  })
  R.success(res, null)
}
