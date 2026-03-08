import { Response, NextFunction } from 'express'
import { Role, AuthRequest } from '../types'
import { forbidden, unauthorized } from '../utils/response'

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res)
      return
    }
    if (!roles.includes(req.user.role as Role)) {
      forbidden(res, 'No tienes permiso para acceder a este recurso')
      return
    }
    next()
  }
}

export const requireAdmin = requireRole(Role.ADMIN)
export const requireClient = requireRole(Role.CLIENT, Role.ADMIN)
