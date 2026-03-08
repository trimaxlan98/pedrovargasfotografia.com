import { Response } from 'express'
import { ApiResponse, PaginationMeta } from '../types'

export function success<T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200,
  meta?: PaginationMeta
): Response {
  const response: ApiResponse<T> = { success: true, message, data, meta }
  return res.status(statusCode).json(response)
}

export function created<T>(res: Response, data: T, message = 'Creado exitosamente'): Response {
  return success(res, data, message, 201)
}

export function noContent(res: Response): Response {
  return res.status(204).send()
}

export function badRequest(res: Response, message = 'Solicitud inválida', error?: string): Response {
  const response: ApiResponse = { success: false, message, error }
  return res.status(400).json(response)
}

export function unauthorized(res: Response, message = 'No autorizado'): Response {
  const response: ApiResponse = { success: false, message }
  return res.status(401).json(response)
}

export function forbidden(res: Response, message = 'Acceso denegado'): Response {
  const response: ApiResponse = { success: false, message }
  return res.status(403).json(response)
}

export function notFound(res: Response, message = 'Recurso no encontrado'): Response {
  const response: ApiResponse = { success: false, message }
  return res.status(404).json(response)
}

export function conflict(res: Response, message = 'Conflicto con el recurso existente'): Response {
  const response: ApiResponse = { success: false, message }
  return res.status(409).json(response)
}

export function serverError(res: Response, message = 'Error interno del servidor'): Response {
  const response: ApiResponse = { success: false, message }
  return res.status(500).json(response)
}

export function paginate<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'OK'
): Response {
  const meta: PaginationMeta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
  return success(res, data, message, 200, meta)
}
