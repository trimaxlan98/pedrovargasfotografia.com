"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.isStrongPassword = isStrongPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
async function hashPassword(plain) {
    return bcryptjs_1.default.hash(plain, SALT_ROUNDS);
}
async function comparePassword(plain, hash) {
    return bcryptjs_1.default.compare(plain, hash);
}
function isStrongPassword(password) {
    // Mínimo 8 chars, 1 mayúscula, 1 minúscula, 1 número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}
//# sourceMappingURL=password.js.map