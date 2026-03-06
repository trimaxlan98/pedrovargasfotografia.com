import { Response } from 'express';
import { PaginationMeta } from '../types';
export declare function success<T>(res: Response, data: T, message?: string, statusCode?: number, meta?: PaginationMeta): Response;
export declare function created<T>(res: Response, data: T, message?: string): Response;
export declare function noContent(res: Response): Response;
export declare function badRequest(res: Response, message?: string, error?: string): Response;
export declare function unauthorized(res: Response, message?: string): Response;
export declare function forbidden(res: Response, message?: string): Response;
export declare function notFound(res: Response, message?: string): Response;
export declare function conflict(res: Response, message?: string): Response;
export declare function serverError(res: Response, message?: string): Response;
export declare function paginate<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string): Response;
//# sourceMappingURL=response.d.ts.map