import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { unauthorized } from '../utils/response'
import { AuthRequest } from '../types'

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    unauthorized(res, 'Token de acceso requerido')
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    unauthorized(res, 'Token inválido o expirado')
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(authHeader.slice(7))
    } catch {
      // token inválido ignorado en rutas opcionales
    }
  }
  next()
}
