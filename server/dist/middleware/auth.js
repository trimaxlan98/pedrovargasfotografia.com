"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        (0, response_1.unauthorized)(res, 'Token de acceso requerido');
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch {
        (0, response_1.unauthorized)(res, 'Token inválido o expirado');
    }
}
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            req.user = (0, jwt_1.verifyAccessToken)(authHeader.slice(7));
        }
        catch {
            // token inválido ignorado en rutas opcionales
        }
    }
    next();
}
//# sourceMappingURL=auth.js.map