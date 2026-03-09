"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const archivalService_1 = require("./services/archivalService");
const prisma_1 = __importDefault(require("./utils/prisma"));
const password_1 = require("./utils/password");
async function initAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Admin';
        if (!adminEmail || !adminPassword)
            return;
        const exists = await prisma_1.default.user.findUnique({ where: { email: adminEmail } });
        if (!exists) {
            const hashed = await (0, password_1.hashPassword)(adminPassword);
            await prisma_1.default.user.create({
                data: { email: adminEmail, password: hashed, name: adminName, role: 'ADMIN' },
            });
            console.log(`✅ Admin creado: ${adminEmail}`);
        }
    }
    catch (e) {
        console.error('initAdmin error:', e.message);
    }
}
const PORT = Number(process.env.PORT) || 3001;
const stopArchivalWorkflow = (0, archivalService_1.startArchivalWorkflow)();
const server = app_1.default.listen(PORT, () => {
    console.log(`\n🎯 Pedro Vargas Fotografía API`);
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
    void initAdmin();
});
server.on('error', (err) => {
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    stopArchivalWorkflow();
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