"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.created = created;
exports.noContent = noContent;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.notFound = notFound;
exports.conflict = conflict;
exports.serverError = serverError;
exports.paginate = paginate;
function success(res, data, message = 'OK', statusCode = 200, meta) {
    const response = { success: true, message, data, meta };
    return res.status(statusCode).json(response);
}
function created(res, data, message = 'Creado exitosamente') {
    return success(res, data, message, 201);
}
function noContent(res) {
    return res.status(204).send();
}
function badRequest(res, message = 'Solicitud inválida', error) {
    const response = { success: false, message, error };
    return res.status(400).json(response);
}
function unauthorized(res, message = 'No autorizado') {
    const response = { success: false, message };
    return res.status(401).json(response);
}
function forbidden(res, message = 'Acceso denegado') {
    const response = { success: false, message };
    return res.status(403).json(response);
}
function notFound(res, message = 'Recurso no encontrado') {
    const response = { success: false, message };
    return res.status(404).json(response);
}
function conflict(res, message = 'Conflicto con el recurso existente') {
    const response = { success: false, message };
    return res.status(409).json(response);
}
function serverError(res, message = 'Error interno del servidor') {
    const response = { success: false, message };
    return res.status(500).json(response);
}
function paginate(res, data, total, page, limit, message = 'OK') {
    const meta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
    return success(res, data, message, 200, meta);
}
//# sourceMappingURL=response.js.map