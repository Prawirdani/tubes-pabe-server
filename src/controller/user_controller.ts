import { Router, NextFunction, Request, Response } from 'express';
import { MakeResponse } from '../utils/response';
import { ErrNotFound } from '../middleware/error';

const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Lorem Ipsum' },
];

const getUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json(MakeResponse(users));
};

const getUserById = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = users.find((user) => user.id === Number(id));
        if (!user) {
            throw ErrNotFound('User not found');
        }
        res.status(200).json(MakeResponse(user));
    } catch (error) {
        next(error);
    }
};

const createUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        const newUser = { id: users.length + 1, name };
        users.push(newUser);
        res.status(201).json(MakeResponse(newUser, 'User created'));
    } catch (error) {
        next(error);
    }
};

const userRoute = Router();
userRoute.get('/users', getUser);
userRoute.get('/users/:id', getUserById);
userRoute.post('/users', createUser);

export default userRoute;
