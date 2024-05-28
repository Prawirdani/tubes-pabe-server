import express, { Router } from 'express';
import userRoute from './user_controller';
import authRoute from './auth_controller';
import booksRoute from './books_controller';

const apiRoute = Router();

apiRoute.use('/api', userRoute);
apiRoute.use('/api', authRoute);
apiRoute.use('/api', booksRoute);
// Images route
apiRoute.use('/api/images', express.static('uploads'));

export default apiRoute;
