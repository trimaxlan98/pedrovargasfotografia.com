export declare function sendContactNotification(data: {
    name: string;
    email: string;
    phone?: string;
    eventDate?: string;
    service: string;
    message: string;
}): Promise<void>;
export declare function sendWelcomeEmail(data: {
    to: string;
    name: string;
    tempPassword?: string;
}): Promise<void>;
export declare function sendBookingConfirmation(data: {
    to: string;
    name: string;
    service: string;
    eventDate: string;
    bookingId: string;
}): Promise<void>;
//# sourceMappingURL=email.d.ts.map