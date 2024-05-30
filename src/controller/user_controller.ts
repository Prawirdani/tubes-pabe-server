import { Router, NextFunction, Request, Response } from 'express';
import { MakeResponse } from '../utils/response';
import { AuthAccessToken } from './middleware/authenticate';
import { validateRequest } from '../utils/validator';
import {
  UserResetPasswordSchema,
  UserUpdateSchema,
  userResetPasswordSchema,
  userUpdateSchema,
} from '../schemas/user_schema';
import { eq } from 'drizzle-orm';
import { users } from '../db/schemas/users';
import { ErrNotFound } from '../utils/error';
import db from '../db';
import bcrypt from 'bcrypt';

const userRoute = Router();
userRoute.get('/users', AuthAccessToken, getUsers);
userRoute.put('/users/:id', AuthAccessToken, updateUser);
userRoute.put('/users/:id/reset-password', AuthAccessToken, resetPassword);
userRoute.delete('/users/:id', AuthAccessToken, deleteUser);
export default userRoute;

async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await db.query.users.findMany({
      columns: {
        password: false,
      },
    });
    res.status(200).json(MakeResponse(users));
  } catch (error) {
    next(error);
  }
}

async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    validateRequest(userUpdateSchema, req.body);
    const request = req.body as UserUpdateSchema;

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(id)),
    });

    if (!user) {
      throw ErrNotFound('User tidak ditemukan!');
    }

    await db
      .update(users)
      .set(request)
      .where(eq(users.id, Number(id)));

    res.status(200).json(MakeResponse(user, 'Berhasil update data user!'));
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    validateRequest(userResetPasswordSchema, req.body);
    const request = req.body as UserResetPasswordSchema;

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(id)),
    });

    if (!user) {
      throw ErrNotFound('User tidak ditemukan!');
    }

    const newPassword = await bcrypt.hash(request.newPassword, 10);
    await db
      .update(users)
      .set({
        password: newPassword,
      })
      .where(eq(users.id, Number(id)));

    res.status(200).json(MakeResponse(user, 'Berhasil reset password user!'));
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(id)),
    });

    if (!user) {
      throw ErrNotFound('User tidak ditemukan!');
    }

    await db.delete(users).where(eq(users.id, Number(id)));
    res.status(200).json(MakeResponse(null, 'Berhasil hapus user!'));
  } catch (error) {
    next(error);
  }
}
