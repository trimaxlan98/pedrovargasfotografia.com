"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const response_1 = require("../utils/response");
function errorHandler(err, _req, res, _next) {
    console.error('[ERROR]', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    (0, response_1.serverError)(res, process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor');
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.path}`,
    });
}
//# sourceMappingURL=errorHandler.js.map