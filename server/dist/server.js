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
    // Backup the DB before applying migrations so data can be recovered if something goes wrong
    backupDatabase();
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
    // Seed: XV Años de Grethel — one-time, idempotent
    try {
        const GRETHEL_EMAIL = 'grethel.huerta@gmail.com';
        const GRETHEL_TITLE = 'XV Años de Grethel';
        // Check if already seeded
        const existingClient = await prisma.user.findUnique({ where: { email: GRETHEL_EMAIL }, select: { id: true } });
        const alreadySeeded = existingClient
            ? (await prisma.digitalInvitation.count({ where: { clientId: existingClient.id, title: GRETHEL_TITLE } })) > 0
            : false;
        if (!alreadySeeded) {
            console.log('[startup] Sembrando invitaciones XV Grethel...');
            // Create or find client
            let clientId;
            if (existingClient) {
                clientId = existingClient.id;
            }
            else {
                const hashed = await hashPassword('Grethel2026!');
                const user = await prisma.user.create({
                    data: { name: 'Grethel Huerta', email: GRETHEL_EMAIL, phone: '527681000000', password: hashed, role: 'CLIENT', isActive: true },
                    select: { id: true },
                });
                clientId = user.id;
            }
            // Create master invitation
            const inv = await prisma.digitalInvitation.create({
                data: {
                    clientId,
                    invitationType: 'individual',
                    title: GRETHEL_TITLE,
                    names: 'Grethel',
                    eventType: 'XV Años',
                    eventDate: '2026-05-02',
                    eventTime: '18:00 hrs',
                    template: 'floral',
                    quote: '"Hoy comienzan los mejores años de mi vida"',
                    dressCode: 'Formal',
                    hashtag: '#XVGrethel',
                    parentsInfo: JSON.stringify(['Ramón Rojas González', 'Grissel Huerta Méndez']),
                    sponsorsInfo: JSON.stringify(['Rogelio Huerta Méndez', 'Erika Michel Zepeda Vicencio']),
                    giftsInfo: 'Lluvia de sobres',
                    rsvpLabel: 'Confirmar asistencia',
                    rsvpValue: '527681000000',
                    rsvpDeadline: new Date('2026-04-14T12:00:00.000Z'),
                    ceremonyVenue: 'Hotel Royal Garden',
                    ceremonyAddress: 'Hotel Royal Garden',
                    ceremonyTime: '18:00 hrs',
                    receptionVenue: 'Hotel Royal Garden',
                    receptionAddress: 'Hotel Royal Garden',
                    receptionTime: '19:00 hrs',
                    guestGreeting: 'Con mucho cariño te invitamos',
                    defaultGuestName: 'Familia y Amigos',
                    isPublished: true,
                },
                select: { id: true },
            });
            // Build guests list
            const buildMsg = (name, passes) => {
                const firstName = name.split(' ')[0];
                return passes === 1
                    ? `Esta invitación es personal para ti, ${firstName}. ¡Te esperamos con mucho cariño! 🎀`
                    : `Esta invitación es válida para ${passes} personas. ¡Los esperamos a todos, ${firstName}! 🎀`;
            };
            const GUESTS = [
                { name: 'DENNISE HERRERA Y FAMILIA', passes: 3 }, { name: 'MARISOL GARCIA Y FAMILIA', passes: 5 },
                { name: 'ERIKA VICENCIO Y FAMILIA', passes: 4 }, { name: 'BIANCA LANDA Y FAMILIA', passes: 4 },
                { name: 'MANUEL HUERTA LOPEZ Y FAMILIA', passes: 2 }, { name: 'ALMA HUERTA LOPEZ Y FAMILIA', passes: 4 },
                { name: 'RAUL HUERTA LOPEZ Y FAMILIA', passes: 4 }, { name: 'DAVID HUERTA LOPEZ Y FAMILIA', passes: 2 },
                { name: 'DANIEL HUERTA LOPEZ Y FAMILIA', passes: 2 }, { name: 'OMAR HUERTA MENDEZ', passes: 3 },
                { name: 'FANY HUERTA MENDEZ', passes: 3 }, { name: 'ALEIYI HUERTA MENDEZ', passes: 1 },
                { name: 'MANUEL HUERTA MENDEZ', passes: 2 }, { name: 'DANIEL HUERTA ESPINOZA Y FAMILIA', passes: 4 },
                { name: 'PERSIS HUERTA ESPINOZA', passes: 1 }, { name: 'ARIEL HERNANDEZ ESPINOZA', passes: 2 },
                { name: 'JONATHAN HERNANDEZ', passes: 1 }, { name: 'OSIRIS HERNANDEZ', passes: 1 },
                { name: 'DAVID HUERTA RAMOS', passes: 1 }, { name: 'CRISTINA HUERTA RAMOS', passes: 5 },
                { name: 'CELESTINO CUERVO Y FAMILIA', passes: 2 }, { name: 'IVAN DEL RIO', passes: 2 },
                { name: 'NAYELI FLORES Y FAMILIA', passes: 4 }, { name: 'DAFNE SOBREVILLA', passes: 2 },
                { name: 'SARAI PEREZ CISNEROS', passes: 2 }, { name: 'CRISTINA HUERTA GOMEZ', passes: 5 },
                { name: 'ESPERANZA HUERTA GOMEZ', passes: 2 }, { name: 'MICHEL ZEPEDA', passes: 10 },
                { name: 'JORGE ROJAS', passes: 5 }, { name: 'PEPE ROJAS', passes: 2 },
                { name: 'BEATRIZ ROJAS LARIOS Y FAMILIA', passes: 7 }, { name: 'MARCOS ROJAS Y FAMILIA', passes: 2 },
                { name: 'ANA REYES', passes: 2 }, { name: 'JOEL SIERRA Y FAMILIA', passes: 5 },
                { name: 'JORGE SIERRA Y FAMILIA', passes: 3 }, { name: 'JAIME ROJAS Y FAMILIA', passes: 4 },
                { name: 'VERONICA ROJAS Y FAMILIA', passes: 4 }, { name: 'CELINA Y FAMILIA', passes: 5 },
                { name: 'ITZEL Y FAMILIA', passes: 3 }, { name: 'ITZEL MENDEZ', passes: 1 },
                { name: 'CELINA Y FAMILIA (2)', passes: 2 }, { name: 'FAMILIA', passes: 4 },
                { name: 'KASTENI', passes: 1 }, { name: 'ANGEL', passes: 2 },
                { name: 'HUGO RODRIGUEZ Y FAMILIA', passes: 6 }, { name: 'HUGO RODRIGUEZ TREJO Y FAMILIA', passes: 3 },
                { name: 'ALBERTO RODRIGUEZ CAMACHO Y FAMILIA', passes: 6 }, { name: 'MARCE', passes: 2 },
                { name: 'MARICONCHIS', passes: 2 }, { name: 'NORA', passes: 2 },
                { name: 'PEDRO MALERVA', passes: 2 }, { name: 'LIZ', passes: 3 },
                { name: 'YELVI', passes: 2 }, { name: 'ROCIO VALDEZ', passes: 3 },
                { name: 'FLOR HERNANDEZ', passes: 3 }, { name: 'ROCIO LARA', passes: 2 },
                { name: 'EDUARDO SOLIS', passes: 2 }, { name: 'HERBERT REYES', passes: 2 },
                { name: 'ANY PATIÑO Y FAMILIA', passes: 3 }, { name: 'FELIPA ROJAS', passes: 2 },
                { name: 'MIGUEL VIDAL Y FAMILIA', passes: 3 }, { name: 'JOSE ROJAS Y FAMILIA', passes: 4 },
                { name: 'ROXANA MENDEZ', passes: 2 }, { name: 'MAMA AXEL', passes: 2 },
                { name: 'PSICOLOGO NARCISO', passes: 1 }, { name: 'MAESTRA ROSA', passes: 2 },
                { name: 'MAESTRA FLORA', passes: 1 }, { name: 'MAESTRA TAMARA', passes: 1 },
                { name: 'MAESTRO FRANCISCO', passes: 1 }, { name: 'MAESTRA MICHEL', passes: 1 },
                { name: 'MAESTRA TERESITA', passes: 1 }, { name: 'MAESTRA ADRY', passes: 4 },
                { name: 'MAESTRO MARIO', passes: 1 }, { name: 'MAESTRA SILVIA', passes: 2 },
                { name: 'MAESTRA BETTY', passes: 1 }, { name: 'ALVIS MAYA', passes: 2 },
                { name: 'YILIANA Y FAMILIA', passes: 4 }, { name: 'PADRE JUAN', passes: 2 },
                { name: 'VIKY EURO', passes: 1 }, { name: 'ISA EURO', passes: 1 },
                { name: 'REBECA SOTO TORRES', passes: 2 }, { name: 'IVETTE', passes: 2 },
                { name: 'BRUNO', passes: 2 }, { name: 'CARLOS PINEDA PULIDO', passes: 2 },
                { name: 'ESDEYNE ALEJANDRE HUERTA', passes: 1 }, { name: 'GUSTAVO ALEJANDRE HUERTA', passes: 2 },
                { name: 'VALERIA', passes: 1 }, { name: 'ALONDRA', passes: 1 },
                { name: 'DANIA', passes: 1 }, { name: 'BLANCA', passes: 1 },
                { name: 'RENATA', passes: 1 }, { name: 'DAFNE', passes: 1 },
                { name: 'LOHANY', passes: 1 }, { name: 'ZAIRA', passes: 1 },
                { name: 'FRIDA', passes: 1 }, { name: 'FATIMA', passes: 1 },
                { name: 'ROBERTO', passes: 1 }, { name: 'AKBAL', passes: 1 },
                { name: 'MATEO TAPIA', passes: 1 }, { name: 'DEAN', passes: 1 },
                { name: 'JOSE MIGUEL', passes: 1 }, { name: 'BRUNO (AMIGO)', passes: 1 },
                { name: 'CALIXTO', passes: 1 }, { name: 'SEBASTIAN', passes: 1 },
                { name: 'KAYLEIGH', passes: 1 }, { name: 'TANIA', passes: 1 },
                { name: 'IVAN DEL RIO (AMIGO)', passes: 1 }, { name: 'ARTURO', passes: 1 },
                { name: 'DERECK', passes: 1 }, { name: 'AARON', passes: 1 },
                { name: 'MILAN', passes: 1 }, { name: 'ADAL', passes: 1 },
                { name: 'EMILIANO P', passes: 1 }, { name: 'DAVID', passes: 1 },
                { name: 'KARLA', passes: 1 }, { name: 'DANNA', passes: 1 },
                { name: 'SOFIA SOTO', passes: 1 }, { name: 'ANA BETANCOURT', passes: 1 },
                { name: 'MAITE', passes: 1 }, { name: 'CLEMENTINA', passes: 1 },
                { name: 'HANIA', passes: 1 }, { name: 'JIMENA', passes: 1 },
                { name: 'ALEXA RAMOS', passes: 1 }, { name: 'CRISTELL', passes: 1 },
                { name: 'MAJO', passes: 1 }, { name: 'MELO', passes: 1 },
                { name: 'SOFIA SALAS', passes: 1 }, { name: 'KENNYA', passes: 1 },
                { name: 'ITALIA', passes: 1 }, { name: 'MARIANO', passes: 1 },
                { name: 'MANANNE', passes: 1 }, { name: 'VALENTINA', passes: 1 },
                { name: 'ZAKY', passes: 1 }, { name: 'TABATA', passes: 1 },
                { name: 'REGINA', passes: 1 }, { name: 'MONICA', passes: 1 },
                { name: 'JULIETTA', passes: 1 }, { name: 'IVANNA', passes: 1 },
                { name: 'JOSUE', passes: 1 }, { name: 'BASTIAN', passes: 1 },
                { name: 'CAMILA', passes: 1 }, { name: 'KAMILE', passes: 1 },
                { name: 'OMAR', passes: 1 }, { name: 'ROGELIO', passes: 1 },
                { name: 'VALERIA (AMIGA)', passes: 1 }, { name: 'LLUVIA', passes: 1 },
                { name: 'ANA SOFIA', passes: 1 }, { name: 'KAREN', passes: 1 },
                { name: 'AXEL', passes: 1 }, { name: 'MATEO VAZQUEZ', passes: 1 },
                { name: 'MAX', passes: 1 }, { name: 'DOMINICA', passes: 1 },
                { name: 'MAURICIO', passes: 1 },
            ];
            await prisma.invitationGuest.createMany({
                data: GUESTS.map(({ name, passes }) => ({
                    invitationId: inv.id,
                    name,
                    personalizedMessage: buildMsg(name, passes),
                })),
            });
            console.log(`[startup] XV Grethel: 1 invitación + ${GUESTS.length} invitados creados ✅`);
        }
        else {
            console.log('[startup] XV Grethel: ya sembrado, omitiendo ✅');
        }
    }
    catch (e) {
        console.error('initGrethelXV error:', e.message);
    }
}
/**
 * Copies the SQLite DB file to a timestamped .backup file before migrations run.
 * Gives a recovery point if a deploy goes wrong.
 */
function backupDatabase() {
    const fs = require('fs');
    const dbUrl = process.env.DATABASE_URL || '';
    // Only handle file: SQLite URLs
    const match = dbUrl.match(/^file:(.+)$/);
    if (!match)
        return;
    const dbPath = match[1];
    if (!fs.existsSync(dbPath)) {
        console.log('[startup] DB no encontrada aún, no se hace backup');
        return;
    }
    try {
        const backupPath = dbPath + '.backup';
        fs.copyFileSync(dbPath, backupPath);
        const size = (fs.statSync(dbPath).size / 1024).toFixed(1);
        console.log(`[startup] Backup de DB creado: ${backupPath} (${size} KB)`);
    }
    catch (e) {
        console.warn('[startup] No se pudo crear backup de DB:', e.message);
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
            // Run each statement individually with precise error classification.
            // Only skip errors that are genuinely safe to ignore (idempotent DDL).
            // Any other failure aborts the migration and prevents the server from starting.
            const statements = sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
            for (const stmt of statements) {
                try {
                    await prisma.$executeRawUnsafe(stmt);
                }
                catch (stmtErr) {
                    const msg = stmtErr.message ?? '';
                    // Skip leading SQL comment lines to find the actual statement type
                    const firstCode = stmt.split('\n')
                        .map((l) => l.trim())
                        .find((l) => l.length > 0 && !l.startsWith('--'))
                        ?.toUpperCase() ?? '';
                    // Determine if this is a destructive data statement (INSERT, DROP, UPDATE, DELETE)
                    const isDestructive = firstCode.startsWith('INSERT') ||
                        firstCode.startsWith('DROP') ||
                        firstCode.startsWith('UPDATE') ||
                        firstCode.startsWith('DELETE');
                    // Ignore known idempotency errors on non-destructive statements only:
                    // • "already exists" → CREATE TABLE / CREATE INDEX already ran
                    // • "duplicate column name" → ALTER TABLE ADD COLUMN already ran
                    // • "no such column" / "no such table" → safe only on DDL (CREATE/ALTER)
                    const isKnownIdempotentError = /duplicate column name|already exists|no such column|no such table/i.test(msg);
                    if (isKnownIdempotentError && !isDestructive) {
                        console.warn(`[startup] Statement ya aplicado, omitiendo: ${msg.split('\n')[0]}`);
                        continue;
                    }
                    // Any error on a destructive statement → abort migration to protect data
                    throw stmtErr;
                }
            }
            // Record migration as applied
            const id = crypto.randomUUID();
            await prisma.$executeRawUnsafe(`INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
         VALUES (?, ?, ?, datetime('now'), 1)`, id, checksum, dir);
            console.log(`[startup] Migración aplicada: ${dir}`);
            applied++;
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