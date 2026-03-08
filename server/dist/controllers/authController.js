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
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.getMe = getMe;
exports.acceptTerms = acceptTerms;
exports.updateMe = updateMe;
exports.changePassword = changePassword;
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../utils/prisma"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const R = __importStar(require("../utils/response"));
const activityLogger_1 = require("../utils/activityLogger");
// POST /api/auth/register
async function register(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '));
        return;
    }
    const { name, email, password, phone } = req.body;
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing) {
        R.conflict(res, 'Ya existe una cuenta con ese correo electrónico');
        return;
    }
    const hashed = await (0, password_1.hashPassword)(password);
    const user = await prisma_1.default.user.create({
        data: { name, email, password: hashed, phone, role: 'CLIENT' },
        select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    });
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    await prisma_1.default.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    (0, activityLogger_1.logActivity)({ userId: user.id, userName: user.name, userEmail: user.email, action: 'REGISTER', detail: `Nuevo cliente registrado: ${user.name}` });
    R.created(res, { user, accessToken, refreshToken }, 'Cuenta creada exitosamente');
}
// POST /api/auth/login
async function login(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        R.badRequest(res, 'Datos inválidos');
        return;
    }
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        R.unauthorized(res, 'Credenciales incorrectas');
        return;
    }
    const valid = await (0, password_1.comparePassword)(password, user.password);
    if (!valid) {
        R.unauthorized(res, 'Credenciales incorrectas');
        return;
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    // Limpiar tokens viejos del usuario (máximo 5 sesiones activas)
    const existingTokens = await prisma_1.default.refreshToken.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
    });
    if (existingTokens.length >= 5) {
        await prisma_1.default.refreshToken.deleteMany({
            where: { id: { in: existingTokens.slice(0, -4).map(t => t.id) } },
        });
    }
    await prisma_1.default.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    (0, activityLogger_1.logActivity)({ userId: user.id, userName: user.name, userEmail: user.email, action: 'LOGIN', detail: `Inicio de sesión` });
    const { password: _, ...userWithoutPassword } = user;
    R.success(res, { user: userWithoutPassword, accessToken, refreshToken }, 'Sesión iniciada correctamente');
}
// POST /api/auth/refresh
async function refresh(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        R.badRequest(res, 'Refresh token requerido');
        return;
    }
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        R.unauthorized(res, 'Refresh token inválido o expirado');
        return;
    }
    const stored = await prisma_1.default.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
        if (stored)
            await prisma_1.default.refreshToken.delete({ where: { id: stored.id } });
        R.unauthorized(res, 'Sesión expirada, inicia sesión nuevamente');
        return;
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
        R.unauthorized(res, 'Usuario no encontrado o desactivado');
        return;
    }
    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = (0, jwt_1.signAccessToken)(newPayload);
    const newRefreshToken = (0, jwt_1.signRefreshToken)(newPayload);
    await prisma_1.default.refreshToken.delete({ where: { id: stored.id } });
    await prisma_1.default.refreshToken.create({
        data: {
            token: newRefreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    R.success(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token renovado');
}
// POST /api/auth/logout
async function logout(req, res) {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await prisma_1.default.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    R.success(res, null, 'Sesión cerrada correctamente');
}
// GET /api/auth/me
async function getMe(req, res) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, termsAcceptedAt: true, createdAt: true },
    });
    if (!user) {
        R.notFound(res, 'Usuario no encontrado');
        return;
    }
    R.success(res, user);
}
// PATCH /api/auth/accept-terms
async function acceptTerms(req, res) {
    const user = await prisma_1.default.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
        R.notFound(res, 'Usuario no encontrado');
        return;
    }
    const updated = await prisma_1.default.user.update({
        where: { id: req.user.userId },
        data: { termsAcceptedAt: new Date() },
        select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, termsAcceptedAt: true, createdAt: true },
    });
    (0, activityLogger_1.logActivity)({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: 'TERMS_ACCEPTED',
        detail: `${user.name} aceptó los términos y condiciones`,
    });
    R.success(res, updated, 'Términos y condiciones aceptados');
}
// PATCH /api/auth/me
async function updateMe(req, res) {
    const { name, phone } = req.body;
    const user = await prisma_1.default.user.update({
        where: { id: req.user.userId },
        data: { name, phone },
        select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, updatedAt: true },
    });
    R.success(res, user, 'Perfil actualizado correctamente');
}
// PATCH /api/auth/change-password
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
        R.notFound(res, 'Usuario no encontrado');
        return;
    }
    const valid = await (0, password_1.comparePassword)(currentPassword, user.password);
    if (!valid) {
        R.badRequest(res, 'Contraseña actual incorrecta');
        return;
    }
    const hashed = await (0, password_1.hashPassword)(newPassword);
    await prisma_1.default.user.update({ where: { id: user.id }, data: { password: hashed } });
    await prisma_1.default.refreshToken.deleteMany({ where: { userId: user.id } });
    R.success(res, null, 'Contraseña actualizada. Por seguridad, cierra sesión en otros dispositivos.');
}
//# sourceMappingURL=authController.js.map