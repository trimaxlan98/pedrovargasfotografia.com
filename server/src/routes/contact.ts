import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { submitContact } from '../controllers/contactController'

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { success: false, message: 'Demasiadas solicitudes de contacto, intenta en 1 hora' },
})

const validation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('eventDate').optional().trim(),
  body('service').trim().notEmpty().withMessage('El servicio es requerido'),
  body('message').trim().notEmpty().withMessage('El mensaje es requerido').isLength({ max: 2000 }),
]

router.post('/', contactLimiter, validation, submitContact)

export default router
