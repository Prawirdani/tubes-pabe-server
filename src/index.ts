import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { MakeResponse } from './utils/response';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRoute from './controller/routes';
import { ErrorHandler } from './controller/middleware/error';

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(MakeResponse(null, 'Hello, World!'));
    } catch (error) {
        next(error);
    }
});

app.use(apiRoute);

app.use(ErrorHandler);

const APP_PORT = process.env.APP_PORT ?? 3000;
app.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
});
