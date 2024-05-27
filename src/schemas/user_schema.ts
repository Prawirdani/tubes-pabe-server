import { z } from 'zod';

export const userRegisterSchema = z.object({
    nama: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});
