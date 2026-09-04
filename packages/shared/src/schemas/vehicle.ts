import { z } from 'zod';
import { uuidSchema, plateSchema, documentSchema, paginationSchema } from './common';

export const vehicleTypeSchema = z.enum(['motocicleta', 'mototaxi', 'motocarro', 'cuatrimoto', 'otro']);
export const vehicleUseSchema = z.enum(['particular', 'publico', 'carga', 'mixto', 'institucional']);
export const fuelTypeSchema = z.enum(['gasolina', 'diesel', 'electrico', 'hibrido', 'gas', 'otro']);

export const createVehicleSchema = z.object({
  plate: plateSchema,
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1).max(30),
  cylinderCapacity: z.number().int().positive(),
  fuelType: fuelTypeSchema,
  vehicleType: vehicleTypeSchema,
  vehicleUse: vehicleUseSchema,
  chassisNumber: z.string().min(1).max(50),
  engineNumber: z.string().min(1).max(50),
  soatNumber: z.string().max(50).optional(),
  soatExpiration: z.coerce.date().optional(),
  tecnomecanicaNumber: z.string().max(50).optional(),
  tecnomecanicaExpiration: z.coerce.date().optional(),
  ownerDocument: documentSchema,
  ownerName: z.string().min(1).max(200),
  ownerPhone: z.string().max(20).optional(),
  ownerAddress: z.string().max(500).optional(),
  municipalityId: uuidSchema,
});

export const updateVehicleSchema = z.object({
  brand: z.string().min(1).max(50).optional(),
  model: z.string().min(1).max(50).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().min(1).max(30).optional(),
  cylinderCapacity: z.number().int().positive().optional(),
  fuelType: fuelTypeSchema.optional(),
  vehicleType: vehicleTypeSchema.optional(),
  vehicleUse: vehicleUseSchema.optional(),
  soatNumber: z.string().max(50).optional(),
  soatExpiration: z.coerce.date().optional(),
  tecnomecanicaNumber: z.string().max(50).optional(),
  tecnomecanicaExpiration: z.coerce.date().optional(),
  ownerName: z.string().min(1).max(200).optional(),
  ownerPhone: z.string().max(20).optional(),
  ownerAddress: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const vehicleSearchSchema = paginationSchema.extend({
  plate: z.string().optional(),
  ownerDocument: documentSchema.optional(),
  vehicleType: vehicleTypeSchema.optional(),
  vehicleUse: vehicleUseSchema.optional(),
  municipalityId: uuidSchema.optional(),
  isActive: z.boolean().optional(),
});

export type CreateVehicleDTO = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDTO = z.infer<typeof updateVehicleSchema>;
export type VehicleSearchFilters = z.infer<typeof vehicleSearchSchema>;