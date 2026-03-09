"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = require("http");
const PORT = Number(process.env.PORT) || 3001;
console.log(`\n🎯 Pedro Vargas Fotografía API`);
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Iniciando en puerto ${PORT}...`);
// Request handler — replaced once Express loads
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let requestHandler = null;
const server = (0, http_1.createServer)((req, res) => {
    if (requestHandler) {
        return requestHandler(req, res);
    }
    // Minimal response before Express loads
    if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'loading', time: new Date().toISOString() }));
    }
    else {
        res.writeHead(503);
        res.end('Server starting, please wait...');
    }
});
server.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
    loadApp().catch((err) => {
        console.error('FATAL: falló la carga de la aplicación:', err);
    });
});
async function loadApp() {
    console.log('[startup] Cargando app Express...');
    // Dynamic requires run AFTER server is already listening,
    // so any module-load error is caught and logged instead of causing 503
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('./app').default;
    console.log('[startup] Cargando servicios...');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startArchivalWorkflow } = require('./services/archivalService');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prisma = require('./utils/prisma').default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { hashPassword } = require('./utils/password');
    // Install Express as the request handler
    requestHandler = app;
    console.log('[startup] Express app lista ✅');
    startArchivalWorkflow();
    // Seed admin user
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Admin';
        if (adminEmail && adminPassword) {
            const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
            if (!exists) {
                const hashed = await hashPassword(adminPassword);
                await prisma.user.create({
                    data: { email: adminEmail, password: hashed, name: adminName, role: 'ADMIN' },
                });
                console.log(`✅ Admin creado: ${adminEmail}`);
            }
        }
    }
    catch (e) {
        console.error('initAdmin error:', e.message);
    }
}
server.on('error', (err) => {
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
    });
});
process.on('unhandledRejection', (reason) => {
    console.error('Promesa rechazada sin manejar:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Excepción no capturada:', err);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map