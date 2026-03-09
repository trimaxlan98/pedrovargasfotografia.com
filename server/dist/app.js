"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const client_1 = __importDefault(require("./routes/client"));
const contact_1 = __importDefault(require("./routes/contact"));
const public_1 = __importDefault(require("./routes/public"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200,
    message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);
// ─── Parsers ───────────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// ─── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}
// ─── Archivos estáticos ────────────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express_1.default.static(path_1.default.resolve(uploadDir)));
// Servir frontend construido (producción)
const publicDir = path_1.default.resolve(__dirname, '../../dist');
app.use(express_1.default.static(publicDir));
// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Pedro Vargas Fotografía API funcionando correctamente',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
    });
});
// ─── Rutas ─────────────────────────────────────────────────────────────────────
// authLimiter se aplica solo a rutas sensibles (login/register) en el router de auth
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/client', client_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/public', public_1.default);
// ─── Manejo de SPA (devolver index.html para rutas no encontradas) ──────────────
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return (0, errorHandler_1.notFoundHandler)(req, res);
    }
    res.sendFile(path_1.default.join(publicDir, 'index.html'));
});
// ─── Manejo de errores ─────────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map