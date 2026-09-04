import { z } from 'zod';
import { uuidSchema, plateSchema, documentSchema, paginationSchema } from './common';

export const certificateStatusSchema = z.enum(['emitido', 'revocado', 'vencido', 'suspendido']);

export const certificateQRDataSchema = z.object({
  certificateNumber: z.string(),
  plate: z.string(),
  ownerDocument: z.string(),
  ownerName: z.string(),
  issuedAt: z.string(),
  verificationUrl: z.string().url(),
});

export const createCertificateSchema = z.object({
  censoId: uuidSchema,
});

export const verifyCertificateSchema = z.object({
  certificateNumber: z.string().min(1),
});

export const certificateSearchSchema = paginationSchema.extend({
  certificateNumber: z.string().optional(),
  plate: plateSchema.optional(),
  ownerDocument: documentSchema.optional(),
  municipalityId: uuidSchema.optional(),
  status: certificateStatusSchema.optional(),
  issuedFrom: z.coerce.date().optional(),
  issuedTo: z.coerce.date().optional(),
});

export type CreateCertificateDTO = z.infer<typeof createCertificateSchema>;
export type VerifyCertificateDTO = z.infer<typeof verifyCertificateSchema>;
export type CertificateSearchFilters = z.infer<typeof certificateSearchSchema>;