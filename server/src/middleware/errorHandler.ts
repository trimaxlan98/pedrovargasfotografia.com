import { Request, Response, NextFunction } from 'express'
import { serverError } from '../utils/response'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ERROR]', err.message)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }
  serverError(res, process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor')
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  })
}
