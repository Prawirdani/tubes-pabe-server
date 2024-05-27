import { Router, NextFunction, Request, Response } from 'express';
import authService from '../service/auth_service';
import { validateRequest } from '../utils/validator';
import { authLoginSchema, authRegisterSchema } from '../schemas/auth_schema';
import { MakeResponse } from '../utils/response';

const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRequest(authRegisterSchema, req);
        const { nama, email, password } = req.body;

        const newUser = await authService.register({ nama, email, password });

        res.status(201).json(MakeResponse(newUser, 'User created'));
    } catch (error) {
        next(error);
    }
};

const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRequest(authLoginSchema, req);
        const { email, password } = req.body;

        const token = await authService.login({ email, password });

        const resBody = {
            token: token,
        };
        res.status(200).json(MakeResponse(resBody, 'Berhasil login!'));
    } catch (error) {
        next(error);
    }
};

const authRoute = Router();

authRoute.post('/auth/register', registerController);
authRoute.post('/auth/login', loginController);

export default authRoute;
