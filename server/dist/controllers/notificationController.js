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
exports.listNotifications = listNotifications;
exports.markAllRead = markAllRead;
exports.markRead = markRead;
const prisma_1 = __importDefault(require("../utils/prisma"));
const R = __importStar(require("../utils/response"));
// GET /api/admin/notifications
async function listNotifications(req, res) {
    const limit = Math.min(Number(req.query.limit) || 60, 200);
    const unreadOnly = req.query.unreadOnly === 'true';
    const [logs, unreadCount] = await Promise.all([
        prisma_1.default.activityLog.findMany({
            where: unreadOnly ? { isRead: false } : {},
            orderBy: { createdAt: 'desc' },
            take: limit,
        }),
        prisma_1.default.activityLog.count({ where: { isRead: false } }),
    ]);
    R.success(res, { logs, unreadCount });
}
// PATCH /api/admin/notifications/mark-all-read
async function markAllRead(_req, res) {
    await prisma_1.default.activityLog.updateMany({
        where: { isRead: false },
        data: { isRead: true },
    });
    R.success(res, null, 'Todas las notificaciones marcadas como leídas');
}
// PATCH /api/admin/notifications/:id/read
async function markRead(req, res) {
    const log = await prisma_1.default.activityLog.findUnique({ where: { id: req.params.id } });
    if (!log) {
        R.notFound(res, 'Notificación no encontrada');
        return;
    }
    await prisma_1.default.activityLog.update({
        where: { id: req.params.id },
        data: { isRead: true },
    });
    R.success(res, null);
}
//# sourceMappingURL=notificationController.js.map