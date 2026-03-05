import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'ppfotomx@gmail.com'
  const adminPassword = 'AdminPPFoto2026!'
  const adminName = 'Admin Pedro'

  console.log(`🌱 Creando usuario administrador: ${adminEmail}...`)

  const hashedAdmin = await bcrypt.hash(adminPassword, 12)
  
  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedAdmin,
        role: 'ADMIN',
        name: adminName,
      },
      create: {
        email: adminEmail,
        password: hashedAdmin,
        name: adminName,
        role: 'ADMIN',
      },
    })
    console.log(`✅ Admin creado/actualizado: ${admin.email}`)
    console.log(`🔑 Contraseña: ${adminPassword}`)
  } catch (error) {
    console.error('❌ Error al crear el admin:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
