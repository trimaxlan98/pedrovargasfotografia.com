import { Router } from 'express'
import { body } from 'express-validator'
import * as auth from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Debe tener mayúscula, minúscula y número'),
  body('phone').optional().isMobilePhone('any').withMessage('Teléfono inválido'),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
]

router.post('/register', registerValidation, auth.register)
router.post('/login', loginValidation, auth.login)
router.post('/refresh', auth.refresh)
router.post('/logout', auth.logout)
router.get('/me', authenticate, auth.getMe)
router.patch('/me', authenticate, auth.updateMe)
router.patch('/change-password', authenticate, auth.changePassword)
router.patch('/accept-terms', authenticate, auth.acceptTerms)

export default router
