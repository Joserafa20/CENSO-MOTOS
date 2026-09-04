import { UUID, DocumentNumber, PlateNumber, CensoStatus, ApiResponse, PaginatedResponse } from './common';

export interface Censo {
  id: UUID;
  censoNumber: string; // Unique sequential number
  censistaId: UUID;
  censistaName: string;
  vehicleId?: UUID;
  plate?: PlateNumber;
  ownerDocument: DocumentNumber;
  ownerName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  municipalityId: UUID;
  municipalityName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  photos: CensoPhoto[];
  observations?: string;
  status: CensoStatus;
  validatedAt?: Date;
  validatedBy?: UUID;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CensoPhoto {
  id: UUID;
  url: string;
  type: 'front' | 'back' | 'left' | 'right' | 'plate' | 'chassis' | 'engine' | 'documents' | 'other';
  description?: string;
  takenAt: Date;
}

export interface CreateCensoDTO {
  plate?: string;
  ownerDocument: string;
  ownerName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  municipalityId: UUID;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  photos: Omit<CensoPhoto, 'id' | 'takenAt'>[];
  observations?: string;
}

export interface UpdateCensoDTO {
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  observations?: string;
  photos?: Omit<CensoPhoto, 'id' | 'takenAt'>[];
}

export interface ValidateCensoDTO {
  status: 'completado' | 'rechazado';
  rejectionReason?: string;
}

export interface CensoResponse {
  id: UUID;
  censoNumber: string;
  censistaId: UUID;
  censistaName: string;
  vehicleId?: UUID;
  plate?: PlateNumber;
  ownerDocument: DocumentNumber;
  ownerName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  municipalityId: UUID;
  municipalityName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  photos: CensoPhoto[];
  observations?: string;
  status: CensoStatus;
  validatedAt?: Date;
  validatedBy?: UUID;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CensoSearchFilters {
  censoNumber?: string;
  plate?: string;
  ownerDocument?: string;
  censistaId?: UUID;
  municipalityId?: UUID;
  status?: CensoStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface CensoStats {
  total: number;
  pendiente: number;
  en_proceso: number;
  completado: number;
  rechazado: number;
  cancelado: number;
  byMunicipality: Record<string, number>;
  byVehicleType: Record<string, number>;
  byCensista: Record<string, number>;
}

export type CensoListResponse = ApiResponse<PaginatedResponse<CensoResponse>>;
export type CensoSingleResponse = ApiResponse<CensoResponse>;
export type CensoStatsResponse = ApiResponse<CensoStats>;