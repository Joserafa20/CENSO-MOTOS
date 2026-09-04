import { z } from 'zod';
import { uuidSchema, documentSchema, plateSchema, paginationSchema } from './common';

export const censoStatusSchema = z.enum(['pendiente', 'en_proceso', 'completado', 'rechazado', 'cancelado']);

export const photoTypeSchema = z.enum([
  'front',
  'back',
  'left',
  'right',
  'plate',
  'chassis',
  'engine',
  'documents',
  'other',
]);

export const censoPhotoSchema = z.object({
  url: z.string().url(),
  type: photoTypeSchema,
  description: z.string().max(500).optional(),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  address: z.string().max(500).optional(),
});

export const createCensoSchema = z.object({
  plate: plateSchema.optional(),
  ownerDocument: documentSchema,
  ownerName: z.string().min(1).max(200),
  ownerPhone: z.string().max(20).optional(),
  ownerAddress: z.string().max(500).optional(),
  municipalityId: uuidSchema,
  location: locationSchema,
  photos: z.array(censoPhotoSchema).min(1).max(10),
  observations: z.string().max(1000).optional(),
});

export const updateCensoSchema = z.object({
  ownerName: z.string().min(1).max(200).optional(),
  ownerPhone: z.string().max(20).optional(),
  ownerAddress: z.string().max(500).optional(),
  observations: z.string().max(1000).optional(),
  photos: z.array(censoPhotoSchema).max(10).optional(),
});

export const validateCensoSchema = z.object({
  status: z.enum(['completado', 'rechazado']),
  rejectionReason: z.string().max(500).optional(),
});

export const censoSearchSchema = paginationSchema.extend({
  censoNumber: z.string().optional(),
  plate: plateSchema.optional(),
  ownerDocument: documentSchema.optional(),
  censistaId: uuidSchema.optional(),
  municipalityId: uuidSchema.optional(),
  status: censoStatusSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type CreateCensoDTO = z.infer<typeof createCensoSchema>;
export type UpdateCensoDTO = z.infer<typeof updateCensoSchema>;
export type ValidateCensoDTO = z.infer<typeof validateCensoSchema>;
export type CensoSearchFilters = z.infer<typeof censoSearchSchema>;