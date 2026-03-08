import prisma from './prisma'

export type ActivityAction =
  | 'REGISTER'
  | 'LOGIN'
  | 'TERMS_ACCEPTED'
  | 'BOOKING_CREATED'
  | 'BOOKING_CANCELLED'
  | 'INVITATION_CREATED'
  | 'INVITATION_UPDATED'
  | 'INVITATION_DELETED'

export interface LogActivityParams {
  userId: string
  userName: string
  userEmail: string
  action: ActivityAction
  detail?: string
  metadata?: Record<string, unknown>
}

/** Fire-and-forget activity logger — never throws, never blocks response. */
export function logActivity(params: LogActivityParams): void {
  prisma.activityLog
    .create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        action: params.action,
        detail: params.detail,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    })
    .catch(err => console.error('[activityLogger]', err))
}
