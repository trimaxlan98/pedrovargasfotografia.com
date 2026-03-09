import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import path from 'path'

import authRoutes from './routes/auth'
import adminRoutes from './routes/admin'
import clientRoutes from './routes/client'
import contactRoutes from './routes/contact'
import publicRoutes from './routes/public'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

const app = express()

// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos de autenticación, intenta en 15 minutos' },
})

app.use(globalLimiter)

// ─── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
}

// ─── Archivos estáticos ────────────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
app.use('/uploads', express.static(path.resolve(uploadDir)))

// Servir frontend construido (producción)
const publicDir = path.resolve(__dirname, '../../dist')
app.use(express.static(publicDir))

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Pedro Vargas Fotografía API funcionando correctamente',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

// ─── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/public', publicRoutes)

// ─── Manejo de SPA (devolver index.html para rutas no encontradas) ──────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return notFoundHandler(req, res)
  }
  res.sendFile(path.join(publicDir, 'index.html'))
})

// ─── Manejo de errores ─────────────────────────────────────────────────────────
app.use(errorHandler)

export default app
