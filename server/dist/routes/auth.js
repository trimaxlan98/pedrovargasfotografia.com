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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth = __importStar(require("../controllers/authController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Debe tener mayúscula, minúscula y número'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Teléfono inválido'),
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Contraseña requerida'),
];
router.post('/register', registerValidation, auth.register);
router.post('/login', loginValidation, auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', auth_1.authenticate, auth.getMe);
router.patch('/me', auth_1.authenticate, auth.updateMe);
router.patch('/change-password', auth_1.authenticate, auth.changePassword);
router.patch('/accept-terms', auth_1.authenticate, auth.acceptTerms);
exports.default = router;
//# sourceMappingURL=auth.js.map