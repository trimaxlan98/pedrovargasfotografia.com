import { PrismaClient } from '@prisma/client'
import path from 'path'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const rawDbUrl = process.env.DATABASE_URL || 'file:./dev.db'

// Resolve relative SQLite paths to absolute so the DB file location is always
// predictable regardless of the process working directory (important on Hostinger).
const dbUrl = rawDbUrl.startsWith('file:./')
  ? `file:${path.resolve(__dirname, '..', '..', rawDbUrl.slice(7))}`
  : rawDbUrl

console.log('🔌 Prisma DB:', dbUrl)

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
