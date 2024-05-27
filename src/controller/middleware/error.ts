import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/error';
export function ErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
        res.status(err.status).json({
            error: {
                status: err.status,
                message: err.message,
                details: err.details,
            },
        });
    } else {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
