"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const prisma_1 = __importDefault(require("./prisma"));
/** Fire-and-forget activity logger — never throws, never blocks response. */
function logActivity(params) {
    prisma_1.default.activityLog
        .create({
        data: {
            userId: params.userId,
            userName: params.userName,
            userEmail: params.userEmail,
            action: params.action,
            detail: params.detail,
            metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
        },
    })
        .catch(err => console.error('[activityLogger]', err));
}
//# sourceMappingURL=activityLogger.js.map