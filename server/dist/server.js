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
    activePrisma = prisma;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { hashPassword } = require('./utils/password');
    console.log('[startup] Iniciando motor de base de datos...');
    // Apply pending SQL migrations directly — no CLI needed, no permissions issues.
    await applyMigrations(prisma, require('path').join(__dirname, '..', 'prisma', 'migrations'));
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
/**
 * Applies pending Prisma migrations directly via SQL — no CLI required.
 * Reads migration files from disk and records them in _prisma_migrations.
 */
async function applyMigrations(prisma, migrationsDir) {
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');
    try {
        // Ensure the migrations tracking table exists
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id"                  TEXT    NOT NULL PRIMARY KEY,
        "checksum"            TEXT    NOT NULL,
        "finished_at"         DATETIME,
        "migration_name"      TEXT    NOT NULL,
        "logs"                TEXT,
        "rolled_back_at"      DATETIME,
        "started_at"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);
        const entries = fs.readdirSync(migrationsDir)
            .filter((d) => d !== 'migration_lock.toml' && fs.statSync(path.join(migrationsDir, d)).isDirectory())
            .sort();
        let applied = 0;
        for (const dir of entries) {
            const sqlFile = path.join(migrationsDir, dir, 'migration.sql');
            if (!fs.existsSync(sqlFile))
                continue;
            const sql = fs.readFileSync(sqlFile, 'utf-8');
            const checksum = crypto.createHash('sha256').update(sql).digest('hex');
            // Skip if already applied
            const rows = await prisma.$queryRawUnsafe(`SELECT id FROM "_prisma_migrations" WHERE migration_name = ? AND finished_at IS NOT NULL`, dir);
            if (rows.length > 0)
                continue;
            console.log(`[startup] Aplicando migración: ${dir}`);
            // Run all statements in a transaction — if any statement fails the whole migration rolls back
            const statements = sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
            await prisma.$executeRawUnsafe('BEGIN');
            try {
                for (const stmt of statements) {
                    try {
                        await prisma.$executeRawUnsafe(stmt);
                    }
                    catch (stmtErr) {
                        const msg = stmtErr.message ?? '';
                        const normalized = stmt.trimStart().toUpperCase();
                        // Only ignore errors that are genuinely idempotent:
                        // • CREATE TABLE / CREATE [UNIQUE] INDEX that already exists
                        // • ALTER TABLE ... ADD COLUMN with a column that already exists
                        // Any other error (INSERT, DROP, RENAME, etc.) must abort the migration.
                        const isCreateAlreadyExists = (normalized.startsWith('CREATE TABLE') ||
                            normalized.startsWith('CREATE UNIQUE INDEX') ||
                            normalized.startsWith('CREATE INDEX')) &&
                            /already exists/i.test(msg);
                        const isAddColumnDuplicate = normalized.startsWith('ALTER TABLE') &&
                            normalized.includes('ADD COLUMN') &&
                            /duplicate column name/i.test(msg);
                        if (isCreateAlreadyExists || isAddColumnDuplicate) {
                            console.warn(`[startup] Statement ya aplicado, omitiendo: ${msg.split('\n')[0]}`);
                            continue;
                        }
                        // Any other error: rollback and propagate — do NOT silently skip
                        throw stmtErr;
                    }
                }
                // Record migration as applied
                const id = crypto.randomUUID();
                await prisma.$executeRawUnsafe(`INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
           VALUES (?, ?, ?, datetime('now'), 1)`, id, checksum, dir);
                await prisma.$executeRawUnsafe('COMMIT');
                console.log(`[startup] Migración aplicada: ${dir}`);
                applied++;
            }
            catch (migrationErr) {
                await prisma.$executeRawUnsafe('ROLLBACK').catch(() => { });
                // Re-throw so the server does NOT start with an unknown schema state
                throw migrationErr;
            }
        }
        if (applied === 0) {
            console.log('[startup] DB ya actualizada, sin migraciones pendientes ✅');
        }
        else {
            console.log(`[startup] ${applied} migración(es) aplicada(s) ✅`);
        }
    }
    catch (e) {
        console.error('[startup] FATAL: Error aplicando migraciones:', e.message);
        throw e; // Propagate so the server fails to start instead of running with corrupt schema
    }
}
server.on('error', (err) => {
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
});
// Referencia global al cliente Prisma para desconectar antes de salir
let activePrisma = null;
function gracefulExit(code) {
    const done = () => {
        process.stdout.write(`[exit] Proceso terminando con código ${code}\n`);
        process.exit(code);
    };
    if (activePrisma) {
        const timeout = setTimeout(done, 3000);
        activePrisma.$disconnect().then(() => {
            clearTimeout(timeout);
            done();
        }).catch(done);
    }
    else {
        done();
    }
}
process.on('SIGTERM', () => {
    process.stdout.write('SIGTERM recibido. Cerrando servidor...\n');
    server.close(() => {
        process.stdout.write('Servidor cerrado.\n');
        gracefulExit(0);
    });
});
process.on('unhandledRejection', (reason) => {
    process.stdout.write(`[ERROR] Promesa rechazada sin manejar: ${reason}\n`);
    gracefulExit(1);
});
process.on('uncaughtException', (err) => {
    process.stdout.write(`[ERROR] Excepción no capturada: ${err?.message ?? err}\n${err?.stack ?? ''}\n`);
    gracefulExit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map