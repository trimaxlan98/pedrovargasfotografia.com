import 'dotenv/config'
import app from './app'
import { startArchivalWorkflow } from './services/archivalService'
import prisma from './utils/prisma'
import { hashPassword } from './utils/password'

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

const server = app.listen(PORT, async () => {
  console.log(`\n🎯 Pedro Vargas Fotografía API`)
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`)
  await initAdmin()
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
