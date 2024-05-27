import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { ErrorMiddleware } from './middleware/error';
import { MakeResponse } from './utils/response';
import { MapUserRoutes } from './controller/user_controller';

const app = express();
app.use(express.json());

MapUserRoutes(app);

app.get('/', index);

app.use(ErrorMiddleware);

const APP_PORT = process.env.APP_PORT ?? 3000;
app.listen(APP_PORT, () => {
    console.log(`Server is running on port ${APP_PORT}`);
});

function index(req: Request, res: Response, next: NextFunction) {
    try {
        res.status(200).json(MakeResponse(null, 'Hello, World!'));
    } catch (error) {
        next(error);
    }
}
