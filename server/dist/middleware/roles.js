"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClient = exports.requireAdmin = void 0;
exports.requireRole = requireRole;
const types_1 = require("../types");
const response_1 = require("../utils/response");
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.unauthorized)(res);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_1.forbidden)(res, 'No tienes permiso para acceder a este recurso');
            return;
        }
        next();
    };
}
exports.requireAdmin = requireRole(types_1.Role.ADMIN);
exports.requireClient = requireRole(types_1.Role.CLIENT, types_1.Role.ADMIN);
//# sourceMappingURL=roles.js.map