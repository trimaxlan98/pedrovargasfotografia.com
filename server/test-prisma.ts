import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  })
  
  console.log('DATABASE_URL from env:', process.env.DATABASE_URL)
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@studiolumiere.mx' }
    })
    console.log('User found:', user ? user.email : 'Not found')
  } catch (err) {
    console.error('Prisma Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
