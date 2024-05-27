import { NextFunction, Request, Response } from 'express';
import { ErrUnauthorized } from '../../utils/error';
import { verifyToken } from '../../utils/jwt';

export function Authenticate(type: 'access' | 'refresh' = 'access') {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw ErrUnauthorized('Missing auth token');
            }

            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);

            // Check if the token type is the same as the expected type
            if (type !== decoded.type) {
                throw ErrUnauthorized(`Invalid token type, expected ${type} token`);
            }

            req.user = decoded;
            next();
        } catch (error) {
            next(error);
        }
    };
}
