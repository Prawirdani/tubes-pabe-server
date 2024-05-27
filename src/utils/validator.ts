import { Request } from 'express';
import { ZodError, z } from 'zod';
import { ErrBadRequest, ErrInternalServer } from '../middleware/error';

export function validateRequest(schema: z.ZodObject<any, any>, req: Request) {
    try {
        schema.parse(req.body);
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map((issue: any) => ({
                message: `${issue.path.join('.')} is ${issue.message}`,
            }));
            throw ErrBadRequest('Invalid request body', errorMessages);
        } else {
            throw ErrInternalServer();
        }
    }
}
