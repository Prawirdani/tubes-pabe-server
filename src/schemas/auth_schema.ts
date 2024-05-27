import { z } from 'zod';

export const authRegisterSchema = z.object({
    nama: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});
export type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;

export const authLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type AuthLoginSchema = z.infer<typeof authLoginSchema>;
