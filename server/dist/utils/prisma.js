"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const rawDbUrl = process.env.DATABASE_URL || 'file:./dev.db';
// Resolve relative SQLite paths to absolute so the DB file location is always
// predictable regardless of the process working directory (important on Hostinger).
const dbUrl = rawDbUrl.startsWith('file:./')
    ? `file:${path_1.default.resolve(__dirname, '..', '..', rawDbUrl.slice(7))}`
    : rawDbUrl;
console.log('🔌 Prisma DB:', dbUrl);
const prisma = global.prisma ?? new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map