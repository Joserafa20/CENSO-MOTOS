export type UUID = string & { readonly __brand: unique symbol };
export type Email = string & { readonly __brand: unique symbol };
export type PhoneNumber = string & { readonly __brand: unique symbol };
export type PlateNumber = string & { readonly __brand: unique symbol };
export type DocumentNumber = string & { readonly __brand: unique symbol };

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export type UserRole = 'admin' | 'censista' | 'ciudadano';
export type CensoStatus = 'pendiente' | 'en_proceso' | 'completado' | 'rechazado' | 'cancelado';
export type VehicleType = 'motocicleta' | 'mototaxi' | 'motocarro' | 'cuatrimoto' | 'otro';
export type VehicleUse = 'particular' | 'publico' | 'carga' | 'mixto' | 'institucional';
export type CertificateStatus = 'emitido' | 'revocado' | 'vencido' | 'suspendido';