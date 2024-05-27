import { Router } from 'express';
import userRoute from './user_controller';

const apiRoute = Router();

apiRoute.use('/api', userRoute);

export default apiRoute;
