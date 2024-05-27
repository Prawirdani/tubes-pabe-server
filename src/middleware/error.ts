import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error';
export function ErrorMiddleware(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (err instanceof ApiError) {
		res.status(err.status).json({
			error: {
				status: err.status,
				message: err.message,
			},
		});
	} else {
		res.status(500).json({ error: 'Internal Server Error' });
	}
}

export const ErrNotFound = (msg: string) => new ApiError(msg, 404);
