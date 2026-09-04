import { z } from 'zod';
import { uuidSchema, emailSchema, phoneSchema, documentSchema } from './common';

export const userRoleSchema = z.enum(['admin', 'censista', 'ciudadano']);

export const documentTypeSchema = z.enum(['CC', 'CE', 'PA', 'TI']);

export const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phoneNumber: phoneSchema,
  documentNumber: documentSchema,
  documentType: documentTypeSchema,
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: phoneSchema,
  isActive: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const registerSchema = createUserSchema;

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;