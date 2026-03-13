/**
 * Archives a booking by setting the archivedAt timestamp and reason.
 */
export declare function archiveBooking(id: string, reason?: string): Promise<{
    service: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    eventDate: Date;
    eventType: string;
    venue: string | null;
    guestCount: number | null;
    budget: number | null;
    status: string;
    notes: string | null;
    adminNotes: string | null;
    totalPrice: number | null;
    depositPaid: boolean;
    archivedAt: Date | null;
    archiveReason: string | null;
}>;
/**
 * Archives a digital invitation by setting the archivedAt timestamp and reason.
 */
export declare function archiveInvitation(id: string, reason?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    message: string | null;
    clientId: string;
    eventDate: string;
    eventType: string;
    venue: string | null;
    archivedAt: Date | null;
    archiveReason: string | null;
    shareToken: string;
    title: string;
    names: string;
    eventTime: string | null;
    locationNote: string | null;
    quote: string | null;
    hashtag: string | null;
    template: string;
    primaryColor: string;
    textColor: string;
    fontStyle: string;
    isDark: boolean;
    dressCode: string | null;
    rsvpLabel: string | null;
    rsvpValue: string | null;
    invitationType: string;
    heroImage: string | null;
    gallery: string | null;
    views: number;
    isPublished: boolean;
    rsvpDeadline: Date | null;
    guestGreeting: string | null;
    defaultGuestName: string | null;
    ceremonyVenue: string | null;
    ceremonyAddress: string | null;
    ceremonyTime: string | null;
    ceremonyPhoto: string | null;
    ceremonyMapUrl: string | null;
    receptionVenue: string | null;
    receptionAddress: string | null;
    receptionTime: string | null;
    receptionPhoto: string | null;
    receptionMapUrl: string | null;
    parentsInfo: string | null;
    sponsorsInfo: string | null;
    giftsInfo: string | null;
    instagramHandle: string | null;
}>;
/**
 * Unarchives a booking by clearing the archivedAt timestamp and reason.
 */
export declare function unarchiveBooking(id: string): Promise<{
    service: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    eventDate: Date;
    eventType: string;
    venue: string | null;
    guestCount: number | null;
    budget: number | null;
    status: string;
    notes: string | null;
    adminNotes: string | null;
    totalPrice: number | null;
    depositPaid: boolean;
    archivedAt: Date | null;
    archiveReason: string | null;
}>;
/**
 * Unarchives a digital invitation by clearing the archivedAt timestamp and reason.
 */
export declare function unarchiveInvitation(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    message: string | null;
    clientId: string;
    eventDate: string;
    eventType: string;
    venue: string | null;
    archivedAt: Date | null;
    archiveReason: string | null;
    shareToken: string;
    title: string;
    names: string;
    eventTime: string | null;
    locationNote: string | null;
    quote: string | null;
    hashtag: string | null;
    template: string;
    primaryColor: string;
    textColor: string;
    fontStyle: string;
    isDark: boolean;
    dressCode: string | null;
    rsvpLabel: string | null;
    rsvpValue: string | null;
    invitationType: string;
    heroImage: string | null;
    gallery: string | null;
    views: number;
    isPublished: boolean;
    rsvpDeadline: Date | null;
    guestGreeting: string | null;
    defaultGuestName: string | null;
    ceremonyVenue: string | null;
    ceremonyAddress: string | null;
    ceremonyTime: string | null;
    ceremonyPhoto: string | null;
    ceremonyMapUrl: string | null;
    receptionVenue: string | null;
    receptionAddress: string | null;
    receptionTime: string | null;
    receptionPhoto: string | null;
    receptionMapUrl: string | null;
    parentsInfo: string | null;
    sponsorsInfo: string | null;
    giftsInfo: string | null;
    instagramHandle: string | null;
}>;
/**
 * Retrieves all archived bookings.
 */
export declare function getArchivedBookings(): Promise<({
    client: {
        id: string;
        name: string;
        email: string;
    };
} & {
    service: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    eventDate: Date;
    eventType: string;
    venue: string | null;
    guestCount: number | null;
    budget: number | null;
    status: string;
    notes: string | null;
    adminNotes: string | null;
    totalPrice: number | null;
    depositPaid: boolean;
    archivedAt: Date | null;
    archiveReason: string | null;
})[]>;
/**
 * Retrieves all archived invitations.
 */
export declare function getArchivedInvitations(): Promise<({
    client: {
        id: string;
        name: string;
        email: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    message: string | null;
    clientId: string;
    eventDate: string;
    eventType: string;
    venue: string | null;
    archivedAt: Date | null;
    archiveReason: string | null;
    shareToken: string;
    title: string;
    names: string;
    eventTime: string | null;
    locationNote: string | null;
    quote: string | null;
    hashtag: string | null;
    template: string;
    primaryColor: string;
    textColor: string;
    fontStyle: string;
    isDark: boolean;
    dressCode: string | null;
    rsvpLabel: string | null;
    rsvpValue: string | null;
    invitationType: string;
    heroImage: string | null;
    gallery: string | null;
    views: number;
    isPublished: boolean;
    rsvpDeadline: Date | null;
    guestGreeting: string | null;
    defaultGuestName: string | null;
    ceremonyVenue: string | null;
    ceremonyAddress: string | null;
    ceremonyTime: string | null;
    ceremonyPhoto: string | null;
    ceremonyMapUrl: string | null;
    receptionVenue: string | null;
    receptionAddress: string | null;
    receptionTime: string | null;
    receptionPhoto: string | null;
    receptionMapUrl: string | null;
    parentsInfo: string | null;
    sponsorsInfo: string | null;
    giftsInfo: string | null;
    instagramHandle: string | null;
})[]>;
export declare function startArchivalWorkflow(intervalMs?: number): () => void;
//# sourceMappingURL=archivalService.d.ts.map