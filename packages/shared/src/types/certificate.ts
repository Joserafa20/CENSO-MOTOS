import { UUID, PlateNumber, DocumentNumber, CertificateStatus, ApiResponse, PaginatedResponse } from './common';

export interface Certificate {
  id: UUID;
  certificateNumber: string; // Unique certificate number
  censoId: UUID;
  vehicleId: UUID;
  plate: PlateNumber;
  ownerDocument: DocumentNumber;
  ownerName: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  cylinderCapacity: number;
  fuelType: string;
  vehicleType: string;
  vehicleUse: string;
  municipalityId: UUID;
  municipalityName: string;
  qrCode: string; // Base64 or URL to QR code
  qrData: CertificateQRData;
  pdfUrl?: string;
  status: CertificateStatus;
  issuedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: UUID;
  revocationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateQRData {
  certificateNumber: string;
  plate: string;
  ownerDocument: string;
  ownerName: string;
  issuedAt: string;
  verificationUrl: string;
}

export interface CreateCertificateDTO {
  censoId: UUID;
}

export interface CertificateResponse {
  id: UUID;
  certificateNumber: string;
  censoId: UUID;
  plate: PlateNumber;
  ownerDocument: DocumentNumber;
  ownerName: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  cylinderCapacity: number;
  fuelType: string;
  vehicleType: string;
  vehicleUse: string;
  municipalityId: UUID;
  municipalityName: string;
  qrCode: string;
  qrData: CertificateQRData;
  pdfUrl?: string;
  status: CertificateStatus;
  issuedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: UUID;
  revocationReason?: string;
}

export interface VerifyCertificateDTO {
  certificateNumber: string;
}

export interface VerifyCertificateResponse {
  valid: boolean;
  certificate?: CertificateResponse;
  error?: string;
}

export interface CertificateSearchFilters {
  certificateNumber?: string;
  plate?: string;
  ownerDocument?: string;
  municipalityId?: UUID;
  status?: CertificateStatus;
  issuedFrom?: Date;
  issuedTo?: Date;
  page?: number;
  limit?: number;
}

export type CertificateListResponse = ApiResponse<PaginatedResponse<CertificateResponse>>;
export type CertificateSingleResponse = ApiResponse<CertificateResponse>;
export type VerifyCertificateApiResponse = ApiResponse<VerifyCertificateResponse>;