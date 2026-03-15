import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'

// Asegurar que el directorio existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp/
  const ext = allowed.test(path.extname(file.originalname).toLowerCase())
  const mime = allowed.test(file.mimetype)
  if (ext && mime) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'))
  }
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
})

const audioFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExt = /mp3|m4a|ogg|opus|webm|aac/
  const allowedMime = /audio\/(mpeg|mp4|ogg|opus|webm|aac|x-m4a)|video\/webm/
  const ext = allowedExt.test(path.extname(file.originalname).toLowerCase())
  const mime = allowedMime.test(file.mimetype)
  if (ext || mime) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de audio (mp3, m4a, ogg, opus, webm, aac)'))
  }
}

export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max para audio
})
