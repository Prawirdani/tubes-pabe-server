import { Router, NextFunction, Request, Response } from 'express';
import authService from '../service/auth_service';
import { validateRequest } from '../utils/validator';
import { authLoginSchema, authRegisterSchema } from '../schemas/auth_schema';
import { MakeResponse } from '../utils/response';
import { Authenticate } from './middleware/authenticate';

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRequest(authRegisterSchema, req);
        const { nama, email, password } = req.body;

        const newUser = await authService.register({ nama, email, password });

        res.status(201).json(MakeResponse(newUser, 'User created'));
    } catch (error) {
        next(error);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRequest(authLoginSchema, req);
        const { email, password } = req.body;

        const { ...tokens } = await authService.login({ email, password });

        res.status(200).json(MakeResponse(tokens, 'Berhasil login!'));
    } catch (error) {
        next(error);
    }
};

const currentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(MakeResponse(req.user, 'Berhasil mendapatkan data user'));
    } catch (error) {
        next(error);
    }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const { ...tokens } = await authService.refreshToken(userId!);
        res.status(200).json(MakeResponse(tokens, 'Berhasil refresh token'));
    } catch (error) {
        next(error);
    }
};

const authRoute = Router();

authRoute.post('/auth/register', register);
authRoute.post('/auth/login', login);
authRoute.get('/auth/current', Authenticate(), currentUser);
authRoute.get('/auth/refresh', Authenticate('refresh'), refresh);
export default authRoute;
