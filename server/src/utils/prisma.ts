import { PrismaClient } from '@prisma/client'
import path from 'path'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Resolve SQLite relative paths using __dirname to ensure consistency
// regardless of the working directory when the server starts.
// __dirname here = server/dist/utils, so ../../prisma = server/prisma
function resolveDbUrl(): string {
  const url = process.env.DATABASE_URL || 'file:./dev.db'
  if (url.startsWith('file:./') || url.startsWith('file:../')) {
    const relativePath = url.slice(5) // remove 'file:'
    const absolutePath = path.resolve(__dirname, '../../prisma', path.basename(relativePath))
    return `file:${absolutePath}`
  }
  return url
}

const dbUrl = resolveDbUrl()

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

