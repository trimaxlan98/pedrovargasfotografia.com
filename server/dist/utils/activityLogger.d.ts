export type ActivityAction = 'REGISTER' | 'LOGIN' | 'TERMS_ACCEPTED' | 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'INVITATION_CREATED' | 'INVITATION_UPDATED' | 'INVITATION_DELETED';
export interface LogActivityParams {
    userId: string;
    userName: string;
    userEmail: string;
    action: ActivityAction;
    detail?: string;
    metadata?: Record<string, unknown>;
}
/** Fire-and-forget activity logger — never throws, never blocks response. */
export declare function logActivity(params: LogActivityParams): void;
//# sourceMappingURL=activityLogger.d.ts.map