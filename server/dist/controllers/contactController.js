"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContact = submitContact;
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../utils/prisma"));
const R = __importStar(require("../utils/response"));
const email_1 = require("../utils/email");
// POST /api/contact  — público
async function submitContact(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '));
        return;
    }
    const { name, email, phone, eventDate, service, message } = req.body;
    const contact = await prisma_1.default.contactRequest.create({
        data: { name, email, phone, eventDate, service, message },
    });
    // Notificación por email (no bloquea si falla)
    (0, email_1.sendContactNotification)({ name, email, phone, eventDate, service, message }).catch(console.error);
    R.created(res, { id: contact.id }, 'Solicitud recibida. Te contactaremos en menos de 24 horas.');
}
//# sourceMappingURL=contactController.js.map