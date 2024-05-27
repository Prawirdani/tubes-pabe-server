import { Router } from 'express';
import userRoute from './user_controller';
import authRoute from './auth_controller';

const apiRoute = Router();

apiRoute.use('/api', userRoute);
apiRoute.use('/api', authRoute);

export default apiRoute;
