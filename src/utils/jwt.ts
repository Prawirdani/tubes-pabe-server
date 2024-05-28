import 'dotenv/config';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { ErrUnauthorized } from './error';

const secret = process.env.JWT_SECRET ?? 'secret';
export function generateToken(payload: any, type: 'access' | 'refresh' = 'access') {
  const expiresIn =
    type === 'access'
      ? `${process.env.ACCESS_TOKEN_EXPIRES}m` ?? '1h'
      : `${process.env.REFRESH_TOKEN_EXPIRES}d` ?? '7d';

  // Add token type to payload
  payload['type'] = type;

  return jsonwebtoken.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jsonwebtoken.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw ErrUnauthorized('Invalid or expired token');
  }
}
