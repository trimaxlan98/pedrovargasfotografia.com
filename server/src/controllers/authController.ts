import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prisma from '../utils/prisma'
import { hashPassword, comparePassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { AuthRequest, Role } from '../types'
import * as R from '../utils/response'
import { logActivity } from '../utils/activityLogger'

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '))
    return
  }

  const { name, email, password, phone } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    R.conflict(res, 'Ya existe una cuenta con ese correo electrónico')
    return
  }

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone, role: 'CLIENT' },
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
  })

  const payload = { userId: user.id, email: user.email, role: user.role as Role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  logActivity({ userId: user.id, userName: user.name, userEmail: user.email, action: 'REGISTER', detail: `Nuevo cliente registrado: ${user.name}` })

  R.created(res, { user, accessToken, refreshToken }, 'Cuenta creada exitosamente')
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    R.badRequest(res, 'Datos inválidos')
    return
  }

  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    R.unauthorized(res, 'Credenciales incorrectas')
    return
  }

  const valid = await comparePassword(password, user.password)
  if (!valid) {
    R.unauthorized(res, 'Credenciales incorrectas')
    return
  }

  const payload = { userId: user.id, email: user.email, role: user.role as Role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  // Limpiar tokens viejos del usuario (máximo 5 sesiones activas)
  const existingTokens = await prisma.refreshToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })
  if (existingTokens.length >= 5) {
    await prisma.refreshToken.deleteMany({
      where: { id: { in: existingTokens.slice(0, -4).map(t => t.id) } },
    })
  }

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  logActivity({ userId: user.id, userName: user.name, userEmail: user.email, action: 'LOGIN', detail: `Inicio de sesión` })

  const { password: _, ...userWithoutPassword } = user
  R.success(res, { user: userWithoutPassword, accessToken, refreshToken }, 'Sesión iniciada correctamente')
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body
  if (!refreshToken) {
    R.badRequest(res, 'Refresh token requerido')
    return
  }

  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    R.unauthorized(res, 'Refresh token inválido o expirado')
    return
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } })
    R.unauthorized(res, 'Sesión expirada, inicia sesión nuevamente')
    return
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || !user.isActive) {
    R.unauthorized(res, 'Usuario no encontrado o desactivado')
    return
  }

  const newPayload = { userId: user.id, email: user.email, role: user.role as Role }
  const newAccessToken = signAccessToken(newPayload)
  const newRefreshToken = signRefreshToken(newPayload)

  await prisma.refreshToken.delete({ where: { id: stored.id } })
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  R.success(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token renovado')
}

// POST /api/auth/logout
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
  R.success(res, null, 'Sesión cerrada correctamente')
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, termsAcceptedAt: true, createdAt: true },
  })
  if (!user) {
    R.notFound(res, 'Usuario no encontrado')
    return
  }
  R.success(res, user)
}

// PATCH /api/auth/accept-terms
export async function acceptTerms(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) { R.notFound(res, 'Usuario no encontrado'); return }

  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { termsAcceptedAt: new Date() },
    select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, termsAcceptedAt: true, createdAt: true },
  })

  logActivity({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    action: 'TERMS_ACCEPTED',
    detail: `${user.name} aceptó los términos y condiciones`,
  })

  R.success(res, updated, 'Términos y condiciones aceptados')
}

// PATCH /api/auth/me
export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const { name, phone } = req.body
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, phone },
    select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, updatedAt: true },
  })
  R.success(res, user, 'Perfil actualizado correctamente')
}

// PATCH /api/auth/change-password
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) {
    R.notFound(res, 'Usuario no encontrado')
    return
  }

  const valid = await comparePassword(currentPassword, user.password)
  if (!valid) {
    R.badRequest(res, 'Contraseña actual incorrecta')
    return
  }

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } })

  R.success(res, null, 'Contraseña actualizada. Por seguridad, cierra sesión en otros dispositivos.')
}
