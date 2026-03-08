import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

if (process.env.NODE_ENV === 'development') {
  console.log('🔌 Prisma initializing with URL:', dbUrl)
}

const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: dbUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma

