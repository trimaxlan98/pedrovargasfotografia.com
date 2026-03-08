import { Response, NextFunction } from 'express';
import { Role, AuthRequest } from '../types';
export declare function requireRole(...roles: Role[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireClient: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=roles.d.ts.map