import { Router, NextFunction, Request, Response } from 'express';
import { MakeResponse } from '../utils/response';
import db from '../db/conn';

const getUser = async (req: Request, res: Response, next: NextFunction) => {
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
};

const userRoute = Router();
userRoute.get('/users', getUser);

export default userRoute;
