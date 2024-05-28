import { validateRequest } from '../utils/validator';
import { authLoginSchema, authRegisterSchema } from '../schemas/auth_schema';
import { MakeResponse } from '../utils/response';
import { AuthAccessToken, AuthRefreshToken } from './middleware/authenticate';
import { Router, NextFunction, Request, Response } from 'express';
import authService from '../service/auth_service';
import { setTokenCookie } from '../utils/cookies';

const authRoute = Router();
authRoute.post('/auth/register', register);
authRoute.post('/auth/login', login);
authRoute.get('/auth/current', AuthAccessToken, currentUser);
authRoute.get('/auth/refresh', AuthRefreshToken, refresh);
authRoute.delete('/auth/logout', logout);
export default authRoute;

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    validateRequest(authRegisterSchema, req.body);
    const { nama, email, password } = req.body;

    const newUser = await authService.register({ nama, email, password });

    res.status(201).json(MakeResponse(newUser, 'User created'));
  } catch (error) {
    next(error);
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    validateRequest(authLoginSchema, req.body);
    const { email, password } = req.body;

    const { ...tokens } = await authService.login({ email, password });

    setTokenCookie(res, tokens.accessToken, 'access');
    setTokenCookie(res, tokens.refreshToken, 'refresh');

    res.status(200).json(MakeResponse(tokens, 'Berhasil login!'));
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
    const { ...tokens } = await authService.refreshToken(userId!);

    setTokenCookie(res, tokens.accessToken, 'access');
    setTokenCookie(res, tokens.refreshToken, 'refresh');

    res.status(200).json(MakeResponse(tokens, 'Berhasil refresh token'));
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
