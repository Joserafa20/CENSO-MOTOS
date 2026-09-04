import { UUID, PlateNumber, DocumentNumber, VehicleType, VehicleUse, ApiResponse, PaginatedResponse } from './common';

export interface Vehicle {
  id: UUID;
  plate: PlateNumber;
  brand: string;
  model: string;
  year: number;
  color: string;
  cylinderCapacity: number; // CC
  fuelType: 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | 'otro';
  vehicleType: VehicleType;
  vehicleUse: VehicleUse;
  chassisNumber: string;
  engineNumber: string;
  soatNumber?: string;
  soatExpiration?: Date;
  tecnomecanicaNumber?: string;
  tecnomecanicaExpiration?: Date;
  ownerId: UUID;
  ownerDocument: DocumentNumber;
  ownerName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  municipalityId: UUID;
  municipalityName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleDTO {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  cylinderCapacity: number;
  fuelType: 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | 'otro';
  vehicleType: VehicleType;
  vehicleUse: VehicleUse;
  chassisNumber: string;
  engineNumber: string;
  soatNumber?: string;
  soatExpiration?: string;
  tecnomecanicaNumber?: string;
  tecnomecanicaExpiration?: string;
  ownerDocument: string;
  ownerName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  municipalityId: UUID;
}

export interface UpdateVehicleDTO {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  cylinderCapacity?: number;
  fuelType?: 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | 'otro';
  vehicleType?: VehicleType;
  vehicleUse?: VehicleUse;
  soatNumber?: string;
  soatExpiration?: string;
  tecnomecanicaNumber?: string;
  tecnomecanicaExpiration?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  isActive?: boolean;
}

export interface VehicleResponse {
  id: UUID;
  plate: PlateNumber;
  brand: string;
  model: string;
  year: number;
  color: string;
  cylinderCapacity: number;
  fuelType: string;
  vehicleType: VehicleType;
  vehicleUse: VehicleUse;
  chassisNumber: string;
  engineNumber: string;
  soatNumber?: string;
  soatExpiration?: Date;
  tecnomecanicaNumber?: string;
  tecnomecanicaExpiration?: Date;
  ownerDocument: DocumentNumber;
  ownerName: string;
  ownerPhone?: string;
  ownerAddress?: string;
  municipalityId: UUID;
  municipalityName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleSearchFilters {
  plate?: string;
  ownerDocument?: string;
  vehicleType?: VehicleType;
  vehicleUse?: VehicleUse;
  municipalityId?: UUID;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export type VehicleListResponse = ApiResponse<PaginatedResponse<VehicleResponse>>;
export type VehicleSingleResponse = ApiResponse<VehicleResponse>;