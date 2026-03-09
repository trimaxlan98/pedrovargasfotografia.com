"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const { spawnSync } = require("child_process");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = __importDefault(require("./app"));
const archivalService_1 = require("./services/archivalService");

async function initDatabase() {
    // Ensure DATABASE_URL has a value (SQLite default)
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'file:./dev.db';
    }
    console.log('🔧 Ejecutando migraciones...');
    try {
        const result = spawnSync(
            'node_modules/.bin/prisma',
            ['migrate', 'deploy', '--schema=server/prisma/schema.prisma'],
            {
                stdio: 'pipe',
                cwd: process.cwd(),
                timeout: 60000,
                env: { ...process.env },
            }
        );
        if (result.stdout) console.log(result.stdout.toString());
        if (result.stderr) console.error(result.stderr.toString());
        if (result.error) throw result.error;
        console.log('✅ Migraciones aplicadas');
    }
    catch (e) {
        console.error('⚠️  Error en migraciones (continuando de todos modos):', e.message);
    }
    // Seed admin user if not exists
    const prisma = new client_1.PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } },
    });
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@studiolumiere.mx';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
        const adminName = process.env.ADMIN_NAME || 'Pedro Vargas';
        const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!existing) {
            const hashed = await bcryptjs_1.default.hash(adminPassword, 12);
            await prisma.user.create({
                data: { email: adminEmail, password: hashed, name: adminName, role: 'ADMIN' },
            });
            console.log(`✅ Admin creado: ${adminEmail}`);
        }
        else {
            console.log(`ℹ️  Admin ya existe: ${adminEmail}`);
        }
        // Seed siteSettings if not exists
        const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
        if (!settings) {
            await prisma.siteSettings.create({ data: { id: 'main' } });
            console.log('✅ Configuración inicial del sitio creada');
        }
    }
    catch (e) {
        console.error('⚠️  Error en seed:', e.message);
    }
    finally {
        await prisma.$disconnect();
    }
}

async function main() {
    await initDatabase();
    const PORT = Number(process.env.PORT) || 3001;
    const stopArchivalWorkflow = (0, archivalService_1.startArchivalWorkflow)();
    const server = app_1.default.listen(PORT, () => {
        console.log(`\n🎯 Pedro Vargas Fotografía API`);
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
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
}

main().catch((err) => {
    console.error('Error fatal al iniciar el servidor:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map
