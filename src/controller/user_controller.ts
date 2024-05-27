import { Router, NextFunction, Request, Response } from 'express';
import { MakeResponse } from '../utils/response';
import db from '../db/conn';
import { AuthAccessToken } from './middleware/authenticate';

const userRoute = Router();
userRoute.get('/users', AuthAccessToken, getUsers);
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
