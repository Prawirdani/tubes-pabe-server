import { z } from 'zod';

export const bookCreateSchema = z.object({
    title: z.string(),
    description: z.string(),
    authorId: z.number(),
    price: z.number(),
    image: z.string(),
});
export type BookCreateSchema = z.infer<typeof bookCreateSchema>;
