import { Response } from 'express';
import { AuthRequest } from '../types';
export declare function listNotifications(req: AuthRequest, res: Response): Promise<void>;
export declare function markAllRead(_req: AuthRequest, res: Response): Promise<void>;
export declare function markRead(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=notificationController.d.ts.map