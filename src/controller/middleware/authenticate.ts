import { NextFunction, Request, Response } from 'express';
import { ErrUnauthorized } from '../../utils/error';
import { verifyToken } from '../../utils/jwt';

function Authenticate(type: 'access' | 'refresh' = 'access') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      var token = '';

      const authHeader = req.headers.authorization;
      // Retrieve the token from the Authorization header, if not present try to get it from the cookies
      if (authHeader) {
        token = authHeader.split(' ')[1];
      } else {
        const cookieName = type === 'access' ? 'accessToken' : 'refreshToken';
        token = req.cookies[cookieName] || '';
      }

      // If the token is empty, throw an error
      if (token === '') {
        throw ErrUnauthorized('Missing auth token');
      }

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

export const AuthAccessToken = Authenticate('access');
export const AuthRefreshToken = Authenticate('refresh');
