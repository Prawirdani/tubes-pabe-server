import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import { ErrorMiddleware } from './middlewares/error';
import { JsonResponse } from './utils/response';

const index = (req: Request, res: Response, next: NextFunction) => {
	try {
		res.status(200).json(JsonResponse(null, 'Hello, World!'));
	} catch (error) {
		next(error);
	}
};

const app = express();

app.get('/', index);

app.use(ErrorMiddleware);

const APP_PORT = process.env.APP_PORT ?? 3000;
app.listen(APP_PORT, () => {
	console.log(`Server is running on port ${APP_PORT}`);
});
