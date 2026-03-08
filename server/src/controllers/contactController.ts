import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prisma from '../utils/prisma'
import * as R from '../utils/response'
import { sendContactNotification } from '../utils/email'

// POST /api/contact  — público
export async function submitContact(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    R.badRequest(res, 'Datos inválidos', errors.array().map(e => e.msg).join(', '))
    return
  }

  const { name, email, phone, eventDate, service, message } = req.body

  const contact = await prisma.contactRequest.create({
    data: { name, email, phone, eventDate, service, message },
  })

  // Notificación por email (no bloquea si falla)
  sendContactNotification({ name, email, phone, eventDate, service, message }).catch(console.error)

  R.created(res, { id: contact.id }, 'Solicitud recibida. Te contactaremos en menos de 24 horas.')
}
