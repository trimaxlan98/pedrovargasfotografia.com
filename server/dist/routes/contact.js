"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const contactController_1 = require("../controllers/contactController");
const router = (0, express_1.Router)();
const contactLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: { success: false, message: 'Demasiadas solicitudes de contacto, intenta en 1 hora' },
});
const validation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 20 }),
    (0, express_validator_1.body)('eventDate').optional().trim(),
    (0, express_validator_1.body)('service').trim().notEmpty().withMessage('El servicio es requerido'),
    (0, express_validator_1.body)('message').trim().notEmpty().withMessage('El mensaje es requerido').isLength({ max: 2000 }),
];
router.post('/', contactLimiter, validation, contactController_1.submitContact);
exports.default = router;
//# sourceMappingURL=contact.js.map