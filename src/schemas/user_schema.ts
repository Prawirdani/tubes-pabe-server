import { z } from 'zod';

export const userUpdateSchema = z.object({
  nama: z.string(),
  email: z.string().email(),
});
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

export const userResetPasswordSchema = z
  .object({
    newPassword: z.string().min(6),
    repeatPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: 'Password tidak sama.',
    path: ['repeatPassword'],
  });

export type UserResetPasswordSchema = z.infer<typeof userResetPasswordSchema>;
