"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Prisma initializing with URL:', dbUrl);
}
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