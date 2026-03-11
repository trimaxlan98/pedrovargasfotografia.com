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
    // Apply migrations using the root prisma binary (available in production).
    // This runs with the correct DATABASE_URL env var, unlike the build-time postinstall.
    try {
        const { execSync } = require('child_process');
        const { join } = require('path');
        // __dirname = server/dist  →  ../.. = project root (nodejs/)
        const projectRoot = join(__dirname, '..', '..');
        // Use the running node executable + prisma CLI script to avoid permission issues
        // with .bin/ symlinks on Hostinger
        const prismaCli = join(projectRoot, 'node_modules', 'prisma', 'build', 'index.js');
        const schema = join(projectRoot, 'server', 'prisma', 'schema.prisma');
        console.log('[startup] Aplicando migraciones...');
        const out = execSync(`"${process.execPath}" "${prismaCli}" migrate deploy --schema="${schema}"`, {
            cwd: projectRoot,
            env: process.env,
            stdio: 'pipe',
        });
        console.log('[startup] Migraciones OK ✅', out.toString().trim().split('\n').pop());
    }
    catch (e) {
        const err = e;
        console.error('[startup] Error en migraciones:', err.stderr?.toString() || err.message);
    }
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
            else {
                console.log(`[startup] Admin ya existe: ${adminEmail}`);
            }
        }
    }
    catch (e) {
        console.error('initAdmin error:', e.message);
    }
    // Seed site settings if missing
    try {
        const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
        if (!settings) {
            await prisma.siteSettings.create({
                data: {
                    id: 'main',
                    phone: '+52 55 1234 5678',
                    email: 'hola@pedrovargasfotografia.com',
                    address: 'Ciudad de México, CDMX',
                    heroTitle: 'Cada Momento Contado en Luz',
                    heroSubtitle: 'Fotografía profesional para tus momentos más importantes',
                },
            });
            console.log('[startup] Configuración del sitio creada ✅');
        }
    }
    catch (e) {
        console.error('initSiteSettings error:', e.message);
    }
    // Seed default services if none exist
    try {
        const serviceCount = await prisma.service.count();
        if (serviceCount === 0) {
            const defaultServices = [
                { title: 'Bodas & Celebraciones', description: 'Cada detalle de tu día especial inmortalizado con arte y emoción.', price: 'Desde $15,000 MXN', features: JSON.stringify(['Cobertura completa del evento', 'Álbum digital premium', 'Edición profesional', 'Entrega en 4 semanas']), iconName: 'Heart', order: 1 },
                { title: 'Eventos Corporativos', description: 'Imagen profesional que refleja la esencia de tu empresa.', price: 'Desde $8,000 MXN', features: JSON.stringify(['Fotografía de presentaciones', 'Retratos ejecutivos', 'Eventos y conferencias', 'Licencia comercial']), iconName: 'Briefcase', order: 2 },
                { title: 'Retratos & Sesiones', description: 'Tu personalidad capturada en imágenes que cuentan tu historia.', price: 'Desde $3,500 MXN', features: JSON.stringify(['Sesión de 2 horas', '30 fotos editadas', 'Múltiples looks', 'Galería privada online']), iconName: 'User', order: 3 },
                { title: 'XV Años & Graduaciones', description: 'Hitos de vida que merecen ser recordados para siempre.', price: 'Desde $12,000 MXN', features: JSON.stringify(['Cobertura del evento', 'Sesión previa incluida', 'Video highlight', 'Álbum impreso']), iconName: 'Star', order: 4 },
                { title: 'Fotografía Editorial', description: 'Imágenes con narrativa visual para marcas y publicaciones.', price: 'Desde $10,000 MXN', features: JSON.stringify(['Concepto creativo', 'Dirección de arte', 'Post-producción avanzada', 'Derechos de uso']), iconName: 'Camera', order: 5 },
                { title: 'Video + Foto Combo', description: 'El paquete completo para preservar cada momento en imagen y movimiento.', price: 'Desde $20,000 MXN', features: JSON.stringify(['Foto y video profesional', 'Highlight cinematográfico', 'Drone opcional', 'Disco duro incluido']), iconName: 'Video', order: 6 },
            ];
            await prisma.service.createMany({ data: defaultServices });
            console.log(`[startup] ${defaultServices.length} servicios por defecto creados ✅`);
        }
    }
    catch (e) {
        console.error('initServices error:', e.message);
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