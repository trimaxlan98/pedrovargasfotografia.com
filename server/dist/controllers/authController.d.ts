import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare function register(req: Request, res: Response): Promise<void>;
export declare function login(req: Request, res: Response): Promise<void>;
export declare function refresh(req: Request, res: Response): Promise<void>;
export declare function logout(req: AuthRequest, res: Response): Promise<void>;
export declare function getMe(req: AuthRequest, res: Response): Promise<void>;
export declare function updateMe(req: AuthRequest, res: Response): Promise<void>;
export declare function changePassword(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=authController.d.ts.map