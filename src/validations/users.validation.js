import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(12).trim().optional(),
    email: z.email().toLowerCase().trim().optional(),
    password: z.string().min(6).max(128).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine((updates) => Object.keys(updates).length > 0, {
    message: 'At least one field must be provided',
  });

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
