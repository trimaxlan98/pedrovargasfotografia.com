import { Request } from 'express'

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum ContactStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESPONDED = 'RESPONDED',
  CLOSED = 'CLOSED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface JwtPayload {
  userId: string
  email: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}
