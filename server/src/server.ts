import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import app from './app'
import { startArchivalWorkflow } from './services/archivalService'
import prisma from './utils/prisma'
import { hashPassword } from './utils/password'

// Apply pending DB migrations directly via Prisma executeRaw.
// Avoids spawning child processes (which hang Hostinger's startup timeout).
async function runMigrations() {
  try {
    // Ensure migrations tracking table exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id"                  TEXT NOT NULL PRIMARY KEY,
        "checksum"            TEXT NOT NULL,
        "finished_at"         DATETIME,
        "migration_name"      TEXT NOT NULL,
        "logs"                TEXT,
        "rolled_back_at"      DATETIME,
        "started_at"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `)

    const migrationsDir = path.resolve(__dirname, '../prisma/migrations')
    const entries = fs.readdirSync(migrationsDir)
      .filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory())
      .sort()

    for (const name of entries) {
      const sqlFile = path.join(migrationsDir, name, 'migration.sql')
      if (!fs.existsSync(sqlFile)) continue

      const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
        `SELECT id FROM "_prisma_migrations" WHERE migration_name = ? AND finished_at IS NOT NULL`, name
      )
      if (rows.length > 0) continue

      const sql = fs.readFileSync(sqlFile, 'utf8')
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
      for (const stmt of statements) {
        await prisma.$executeRawUnsafe(stmt)
      }

      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
         VALUES (?, 'manual', ?, datetime('now'), 1)`,
        Math.random().toString(36).slice(2), name
      )
      console.log(`✅ Migración aplicada: ${name}`)
    }
  } catch (e: unknown) {
    console.error('⚠️  Error en migraciones:', (e as Error).message)
  }
}

async function initAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || 'Admin'
  if (!adminEmail || !adminPassword) return

  const exists = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!exists) {
    const hashed = await hashPassword(adminPassword)
    await prisma.user.create({
      data: { email: adminEmail, password: hashed, name: adminName, role: 'ADMIN' },
    })
    console.log(`✅ Admin creado: ${adminEmail}`)
  }
}

const PORT = Number(process.env.PORT) || 3001
const stopArchivalWorkflow = startArchivalWorkflow()

const server = app.listen(PORT, () => {
  console.log(`\n🎯 Pedro Vargas Fotografía API`)
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`)

  // Run async after port is bound so Hostinger's startup check passes immediately
  runMigrations()
    .then(() => initAdmin())
    .catch(e => console.error('Startup error:', e))
})

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...')
  stopArchivalWorkflow()
  server.close(() => {
    console.log('Servidor cerrado.')
    process.exit(0)
  })
})

process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada sin manejar:', reason)
})

export default server
