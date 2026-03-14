import 'dotenv/config'
import { createServer, IncomingMessage, ServerResponse } from 'http'

const PORT = Number(process.env.PORT) || 3001

console.log(`\n🎯 Pedro Vargas Fotografía API`)
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
console.log(`🔌 Iniciando en puerto ${PORT}...`)

// Request handler — replaced once Express loads
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let requestHandler: ((req: IncomingMessage, res: ServerResponse) => any) | null = null

const server = createServer((req, res) => {
  if (requestHandler) {
    return requestHandler(req, res)
  }
  // Minimal response before Express loads
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'loading', time: new Date().toISOString() }))
  } else {
    res.writeHead(503)
    res.end('Server starting, please wait...')
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`)
  console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`)
  loadApp().catch((err: unknown) => {
    console.error('FATAL: falló la carga de la aplicación:', err)
  })
})

async function loadApp() {
  console.log('[startup] Cargando app Express...')
  // Dynamic requires run AFTER server is already listening,
  // so any module-load error is caught and logged instead of causing 503
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const app = (require('./app') as { default: (req: IncomingMessage, res: ServerResponse) => void }).default

  console.log('[startup] Cargando servicios...')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { startArchivalWorkflow } = require('./services/archivalService') as typeof import('./services/archivalService')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prisma = (require('./utils/prisma') as { default: import('@prisma/client').PrismaClient }).default
  activePrisma = prisma

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { hashPassword } = require('./utils/password') as typeof import('./utils/password')

  console.log('[startup] Iniciando motor de base de datos...')
  // Backup the DB before applying migrations so data can be recovered if something goes wrong
  backupDatabase()
  // Apply pending SQL migrations directly — no CLI needed, no permissions issues.
  await applyMigrations(prisma, require('path').join(__dirname, '..', 'prisma', 'migrations'))

  // Install Express as the request handler
  requestHandler = app as typeof requestHandler
  console.log('[startup] Express app lista ✅')

  startArchivalWorkflow()

  // Seed admin user
  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || 'Admin'
    if (adminEmail && adminPassword) {
      const exists = await prisma.user.findUnique({ where: { email: adminEmail } })
      if (!exists) {
        const hashed = await hashPassword(adminPassword)
        await prisma.user.create({
          data: { email: adminEmail, password: hashed, name: adminName, role: 'ADMIN' },
        })
        console.log(`✅ Admin creado: ${adminEmail}`)
      } else {
        console.log(`[startup] Admin ya existe: ${adminEmail}`)
      }
    }
  } catch (e: unknown) {
    console.error('initAdmin error:', (e as Error).message)
  }

  // Seed site settings if missing
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
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
      })
      console.log('[startup] Configuración del sitio creada ✅')
    }
  } catch (e: unknown) {
    console.error('initSiteSettings error:', (e as Error).message)
  }

  // Seed default services if none exist
  try {
    const serviceCount = await prisma.service.count()
    if (serviceCount === 0) {
      const defaultServices = [
        { title: 'Bodas & Celebraciones', description: 'Cada detalle de tu día especial inmortalizado con arte y emoción.', price: 'Desde $15,000 MXN', features: JSON.stringify(['Cobertura completa del evento', 'Álbum digital premium', 'Edición profesional', 'Entrega en 4 semanas']), iconName: 'Heart', order: 1 },
        { title: 'Eventos Corporativos', description: 'Imagen profesional que refleja la esencia de tu empresa.', price: 'Desde $8,000 MXN', features: JSON.stringify(['Fotografía de presentaciones', 'Retratos ejecutivos', 'Eventos y conferencias', 'Licencia comercial']), iconName: 'Briefcase', order: 2 },
        { title: 'Retratos & Sesiones', description: 'Tu personalidad capturada en imágenes que cuentan tu historia.', price: 'Desde $3,500 MXN', features: JSON.stringify(['Sesión de 2 horas', '30 fotos editadas', 'Múltiples looks', 'Galería privada online']), iconName: 'User', order: 3 },
        { title: 'XV Años & Graduaciones', description: 'Hitos de vida que merecen ser recordados para siempre.', price: 'Desde $12,000 MXN', features: JSON.stringify(['Cobertura del evento', 'Sesión previa incluida', 'Video highlight', 'Álbum impreso']), iconName: 'Star', order: 4 },
        { title: 'Fotografía Editorial', description: 'Imágenes con narrativa visual para marcas y publicaciones.', price: 'Desde $10,000 MXN', features: JSON.stringify(['Concepto creativo', 'Dirección de arte', 'Post-producción avanzada', 'Derechos de uso']), iconName: 'Camera', order: 5 },
        { title: 'Video + Foto Combo', description: 'El paquete completo para preservar cada momento en imagen y movimiento.', price: 'Desde $20,000 MXN', features: JSON.stringify(['Foto y video profesional', 'Highlight cinematográfico', 'Drone opcional', 'Disco duro incluido']), iconName: 'Video', order: 6 },
      ]
      await prisma.service.createMany({ data: defaultServices })
      console.log(`[startup] ${defaultServices.length} servicios por defecto creados ✅`)
    }
  } catch (e: unknown) {
    console.error('initServices error:', (e as Error).message)
  }
}

/**
 * Copies the SQLite DB file to a timestamped .backup file before migrations run.
 * Gives a recovery point if a deploy goes wrong.
 */
function backupDatabase(): void {
  const fs = require('fs') as typeof import('fs')
  const dbUrl = process.env.DATABASE_URL || ''
  // Only handle file: SQLite URLs
  const match = dbUrl.match(/^file:(.+)$/)
  if (!match) return
  const dbPath = match[1]
  if (!fs.existsSync(dbPath)) {
    console.log('[startup] DB no encontrada aún, no se hace backup')
    return
  }
  try {
    const backupPath = dbPath + '.backup'
    fs.copyFileSync(dbPath, backupPath)
    const size = (fs.statSync(dbPath).size / 1024).toFixed(1)
    console.log(`[startup] Backup de DB creado: ${backupPath} (${size} KB)`)
  } catch (e: unknown) {
    console.warn('[startup] No se pudo crear backup de DB:', (e as Error).message)
  }
}

/**
 * Applies pending Prisma migrations directly via SQL — no CLI required.
 * Reads migration files from disk and records them in _prisma_migrations.
 */
async function applyMigrations(prisma: import('@prisma/client').PrismaClient, migrationsDir: string): Promise<void> {
  const fs = require('fs') as typeof import('fs')
  const path = require('path') as typeof import('path')
  const crypto = require('crypto') as typeof import('crypto')

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
    `)

    const entries = fs.readdirSync(migrationsDir)
      .filter((d: string) => d !== 'migration_lock.toml' && fs.statSync(path.join(migrationsDir, d)).isDirectory())
      .sort()

    let applied = 0
    for (const dir of entries) {
      const sqlFile = path.join(migrationsDir, dir, 'migration.sql')
      if (!fs.existsSync(sqlFile)) continue

      const sql = fs.readFileSync(sqlFile, 'utf-8')
      const checksum = crypto.createHash('sha256').update(sql).digest('hex')

      // Skip if already applied
      const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM "_prisma_migrations" WHERE migration_name = ? AND finished_at IS NOT NULL`,
        dir,
      )
      if (rows.length > 0) continue

      console.log(`[startup] Aplicando migración: ${dir}`)

      // Run each statement individually with precise error classification.
      // Only skip errors that are genuinely safe to ignore (idempotent DDL).
      // Any other failure aborts the migration and prevents the server from starting.
      const statements = sql.split(/;\s*\n/).map((s: string) => s.trim()).filter(Boolean)
      for (const stmt of statements) {
        try {
          await prisma.$executeRawUnsafe(stmt)
        } catch (stmtErr: unknown) {
          const msg = (stmtErr as Error).message ?? ''

          // Skip leading SQL comment lines to find the actual statement type
          const firstCode = stmt.split('\n')
            .map((l: string) => l.trim())
            .find((l: string) => l.length > 0 && !l.startsWith('--'))
            ?.toUpperCase() ?? ''

          // Determine if this is a destructive data statement (INSERT, DROP, UPDATE, DELETE)
          const isDestructive =
            firstCode.startsWith('INSERT') ||
            firstCode.startsWith('DROP') ||
            firstCode.startsWith('UPDATE') ||
            firstCode.startsWith('DELETE')

          // Ignore known idempotency errors on non-destructive statements only:
          // • "already exists" → CREATE TABLE / CREATE INDEX already ran
          // • "duplicate column name" → ALTER TABLE ADD COLUMN already ran
          // • "no such column" / "no such table" → safe only on DDL (CREATE/ALTER)
          const isKnownIdempotentError = /duplicate column name|already exists|no such column|no such table/i.test(msg)

          if (isKnownIdempotentError && !isDestructive) {
            console.warn(`[startup] Statement ya aplicado, omitiendo: ${msg.split('\n')[0]}`)
            continue
          }

          // Any error on a destructive statement → abort migration to protect data
          throw stmtErr
        }
      }

      // Record migration as applied
      const id = crypto.randomUUID()
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
         VALUES (?, ?, ?, datetime('now'), 1)`,
        id, checksum, dir,
      )
      console.log(`[startup] Migración aplicada: ${dir}`)
      applied++
    }

    if (applied === 0) {
      console.log('[startup] DB ya actualizada, sin migraciones pendientes ✅')
    } else {
      console.log(`[startup] ${applied} migración(es) aplicada(s) ✅`)
    }
  } catch (e: unknown) {
    console.error('[startup] FATAL: Error aplicando migraciones:', (e as Error).message)
    throw e  // Propagate so the server fails to start instead of running with corrupt schema
  }
}

server.on('error', (err) => {
  console.error('Error al iniciar servidor:', err)
  process.exit(1)
})

// Referencia global al cliente Prisma para desconectar antes de salir
let activePrisma: import('@prisma/client').PrismaClient | null = null

function gracefulExit(code: number): void {
  const done = () => {
    process.stdout.write(`[exit] Proceso terminando con código ${code}\n`)
    process.exit(code)
  }
  if (activePrisma) {
    const timeout = setTimeout(done, 3000)
    activePrisma.$disconnect().then(() => {
      clearTimeout(timeout)
      done()
    }).catch(done)
  } else {
    done()
  }
}

process.on('SIGTERM', () => {
  process.stdout.write('SIGTERM recibido. Cerrando servidor...\n')
  server.close(() => {
    process.stdout.write('Servidor cerrado.\n')
    gracefulExit(0)
  })
})

process.on('unhandledRejection', (reason) => {
  process.stdout.write(`[ERROR] Promesa rechazada sin manejar: ${reason}\n`)
  gracefulExit(1)
})

process.on('uncaughtException', (err) => {
  process.stdout.write(`[ERROR] Excepción no capturada: ${err?.message ?? err}\n${(err as Error)?.stack ?? ''}\n`)
  gracefulExit(1)
})

export default server
