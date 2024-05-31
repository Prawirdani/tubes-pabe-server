import db from '../db';
import bcrypt from 'bcrypt';
import {
  AuthLoginSchema,
  AuthRegisterSchema,
  authLoginSchema,
  authRegisterSchema,
} from '../schemas/auth_schema';
import { Router, NextFunction, Request, Response } from 'express';
import { AuthAccessToken, AuthRefreshToken } from './middleware/authenticate';
import { ErrConflict, ErrUnauthorized } from '../utils/error';
import { eq, getTableColumns } from 'drizzle-orm';
import { validateRequest } from '../utils/validator';
import { setTokenCookie } from '../utils/cookies';
import { generateToken } from '../utils/jwt';
import { MakeResponse } from '../utils/response';
import { users } from '../db/schemas/users';

const authRoute = Router();
authRoute.post('/auth/login', login);
authRoute.post('/auth/register', AuthAccessToken, register);
authRoute.get('/auth/current', AuthAccessToken, currentUser);
authRoute.get('/auth/refresh', AuthRefreshToken, refresh);
authRoute.delete('/auth/logout', logout);
export default authRoute;

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    validateRequest(authRegisterSchema, req.body);
    const request = req.body as AuthRegisterSchema;

    const user = await db.query.users.findFirst({
      where: eq(users.email, request.email),
    });

    if (user) {
      throw ErrConflict('Email yang sama sudah terdaftar!');
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const { password, ...rest } = getTableColumns(users); // Omit password from returning query

    const newUser = await db
      .insert(users)
      .values({
        nama: request.nama,
        email: request.email,
        password: hashedPassword,
      })
      .returning({
        ...rest,
      });

    res.status(201).json(MakeResponse(newUser, 'Berhasil register pengguna!'));
  } catch (error) {
    next(error);
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    validateRequest(authLoginSchema, req.body);
    const request = req.body as AuthLoginSchema;

    const user = await db.query.users.findFirst({
      where: eq(users.email, request.email),
    });

    if (!user || !(await bcrypt.compare(request.password, user.password!))) {
      throw ErrUnauthorized('Periksa kembali email dan password Anda');
    }

    const { password, createdAt, updatedAt, ...payload } = user; // Omit password, createdAt and updatedAt from user object
    const accessToken = generateToken(payload);
    const refreshToken = generateToken({ id: payload.id }, 'refresh');

    setTokenCookie(res, accessToken, 'access');
    setTokenCookie(res, refreshToken, 'refresh');

    const resBody = {
      accessToken,
      refreshToken,
    };

    res.status(200).json(MakeResponse(resBody, 'Berhasil login!'));
  } catch (error) {
    next(error);
  }
}

async function currentUser(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(MakeResponse(req.user, 'User authenticated.'));
  } catch (error) {
    next(error);
  }
}

async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw ErrUnauthorized('User not found');
    }

    const { password, createdAt, updatedAt, ...payload } = user; // Omit password, createdAt and updatedAt from user object
    const accessToken = generateToken(payload);
    const refreshToken = generateToken({ id: payload.id }, 'refresh');

    setTokenCookie(res, accessToken, 'access');
    setTokenCookie(res, refreshToken, 'refresh');

    const resBody = {
      accessToken,
      refreshToken,
    };

    res.status(200).json(MakeResponse(resBody, 'Berhasil refresh token'));
  } catch (error) {
    next(error);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json(MakeResponse(null, 'Berhasil logout!'));
  } catch (error) {
    next(error);
  }
}
