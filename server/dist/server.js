"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const archivalService_1 = require("./services/archivalService");
const prisma_1 = __importDefault(require("./utils/prisma"));
const password_1 = require("./utils/password");
// Run DB migrations synchronously before accepting requests.
// Uses direct path to prisma binary to avoid npx download delays.
function runMigrations() {
    const prismaBin = path_1.default.resolve(__dirname, '../../node_modules/.bin/prisma');
    const schemaPath = path_1.default.resolve(__dirname, '../prisma/schema.prisma');
    console.log('⚙️  Ejecutando migraciones...');
    const result = (0, child_process_1.spawnSync)(prismaBin, ['migrate', 'deploy', '--schema', schemaPath], {
        stdio: 'pipe',
        env: process.env,
        timeout: 30000,
    });
    if (result.stdout?.length)
        console.log(result.stdout.toString());
    if (result.stderr?.length)
        console.error(result.stderr.toString());
    if (result.status === 0) {
        console.log('✅ Migraciones aplicadas');
    }
    else {
        console.error('⚠️  Migraciones fallaron, status:', result.status);
    }
}
async function initAdmin() {
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
runMigrations();
const PORT = Number(process.env.PORT) || 3001;
const stopArchivalWorkflow = (0, archivalService_1.startArchivalWorkflow)();
const server = app_1.default.listen(PORT, async () => {
    console.log(`\n🎯 Pedro Vargas Fotografía API`);
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
    await initAdmin().catch(e => console.error('initAdmin error:', e));
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
exports.default = server;
//# sourceMappingURL=server.js.map