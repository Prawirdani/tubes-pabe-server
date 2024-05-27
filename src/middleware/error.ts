import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error';
export function ErrorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // console.error(err);
    if (err instanceof ApiError) {
        res.status(err.status).json({
            error: {
                status: err.status,
                message: err.message,
                details: err.details,
            },
        });
    } else {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const ErrNotFound = (msg: string) => new ApiError(msg, 404);
export const ErrBadRequest = (msg: string, details?: any) =>
    new ApiError(msg, 400, details);
export const ErrInternalServer = () =>
    new ApiError('Internal Server Error', 500);
