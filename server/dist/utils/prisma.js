"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
// Resolve SQLite relative paths using __dirname to ensure consistency
// regardless of the working directory when the server starts.
// __dirname here = server/dist/utils, so ../../prisma = server/prisma
function resolveDbUrl() {
    const url = process.env.DATABASE_URL || 'file:./dev.db';
    if (url.startsWith('file:./') || url.startsWith('file:../')) {
        const relativePath = url.slice(5); // remove 'file:'
        const absolutePath = path_1.default.resolve(__dirname, '../../prisma', path_1.default.basename(relativePath));
        return `file:${absolutePath}`;
    }
    return url;
}
const dbUrl = resolveDbUrl();
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