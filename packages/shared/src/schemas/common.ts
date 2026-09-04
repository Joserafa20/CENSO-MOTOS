import { z } from 'zod';

export const uuidSchema = z.string().uuid({ message: 'ID inválido' });

export const emailSchema = z
  .string()
  .email({ message: 'Email inválido' })
  .max(255);

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Teléfono inválido' })
  .optional();

export const plateSchema = z
  .string()
  .regex(/^[A-Z]{3}[0-9]{3}$/, { message: 'Placa inválida (formato: ABC123)' })
  .toUpperCase();

export const documentSchema = z
  .string()
  .regex(/^\d{6,12}$/, { message: 'Documento inválido' });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});