import { z } from 'zod';

// Schema for create and update author
export const authorSchema = z.object({
  name: z.string(),
  bio: z.string(),
});
export type AuthorSchema = z.infer<typeof authorSchema>;
