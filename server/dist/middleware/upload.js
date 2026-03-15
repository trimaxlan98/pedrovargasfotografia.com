"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAudio = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
// Asegurar que el directorio existe
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
};
exports.uploadImage = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});
const audioFilter = (_req, file, cb) => {
    const allowedExt = /mp3|m4a|ogg|opus|webm|aac/;
    const allowedMime = /audio\/(mpeg|mp4|ogg|opus|webm|aac|x-m4a)|video\/webm/;
    const ext = allowedExt.test(path_1.default.extname(file.originalname).toLowerCase());
    const mime = allowedMime.test(file.mimetype);
    if (ext || mime) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten archivos de audio (mp3, m4a, ogg, opus, webm, aac)'));
    }
};
exports.uploadAudio = (0, multer_1.default)({
    storage,
    fileFilter: audioFilter,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max para audio
});
//# sourceMappingURL=upload.js.map