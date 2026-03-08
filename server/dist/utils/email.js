"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactNotification = sendContactNotification;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendBookingConfirmation = sendBookingConfirmation;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendContactNotification(data) {
    if (!process.env.SMTP_USER)
        return; // Email no configurado, saltar silenciosamente
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER,
        subject: `Nueva solicitud de contacto - ${data.service}`,
        html: `
      <h2>Nueva solicitud de Pedro Vargas Fotografía</h2>
      <p><strong>Nombre:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.phone || 'No proporcionado'}</p>
      <p><strong>Fecha tentativa:</strong> ${data.eventDate || 'No especificada'}</p>
      <p><strong>Servicio:</strong> ${data.service}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${data.message}</p>
    `,
    });
}
async function sendWelcomeEmail(data) {
    if (!process.env.SMTP_USER)
        return;
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: data.to,
        subject: 'Bienvenido a Pedro Vargas Fotografía',
        html: `
      <h2>¡Bienvenido, ${data.name}!</h2>
      <p>Tu cuenta ha sido creada exitosamente en Pedro Vargas Fotografía.</p>
      ${data.tempPassword ? `<p>Contraseña temporal: <strong>${data.tempPassword}</strong></p>` : ''}
      <p>Inicia sesión en: <a href="${process.env.FRONTEND_URL}/login">Pedro Vargas Fotografía</a></p>
    `,
    });
}
async function sendBookingConfirmation(data) {
    if (!process.env.SMTP_USER)
        return;
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: data.to,
        subject: 'Confirmación de reserva - Pedro Vargas Fotografía',
        html: `
      <h2>¡Tu reserva fue recibida, ${data.name}!</h2>
      <p><strong>Servicio:</strong> ${data.service}</p>
      <p><strong>Fecha del evento:</strong> ${data.eventDate}</p>
      <p><strong>ID de reserva:</strong> ${data.bookingId}</p>
      <p>Nos pondremos en contacto contigo para confirmar los detalles.</p>
    `,
    });
}
//# sourceMappingURL=email.js.map