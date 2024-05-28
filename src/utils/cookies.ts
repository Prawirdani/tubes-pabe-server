import 'dotenv/config';
import { Response } from 'express';

export function setTokenCookie(res: Response, token: string, type: 'access' | 'refresh') {
  const httpOnly = process.env.APP_ENV === 'production';
  const cookieName = type === 'access' ? 'accessToken' : 'refreshToken';
  const maxAge =
    type === 'access'
      ? (Number(process.env.ACCESS_TOKEN_EXPIRES) ?? 30) * 60 * 1000
      : (Number(process.env.REFRESH_TOKEN_EXPIRES) ?? 7) * 24 * 60 * 60 * 1000;

  res.cookie(cookieName, token, {
    maxAge,
    httpOnly,
  });
}
