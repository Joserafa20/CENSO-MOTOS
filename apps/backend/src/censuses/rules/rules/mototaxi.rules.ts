import { ActividadMototaxi, Propiedad, Modalidad, Horario } from '@prisma/client';

import {
  ValidationResult,
  RequiredFieldsResult,
} from '../types/rule-result';

interface MototaxiData {
  tipoVehiculo: 'MOTOCICLETA';
  actividad: ActividadMototaxi;
  propiedad?: Propiedad;
  modalidad?: Modalidad;
  valorTarifa?: number;
  estacionId?: string;
  documentosAlDia?: boolean;
  horario?: Horario;
}

export function getMototaxiRequiredFields(): RequiredFieldsResult {
  return {
    required: ['actividad', 'propiedad', 'modalidad', 'documentosAlDia', 'horario'],
    optional: ['valorTarifa', 'estacionId', 'latitud', 'longitud'],
  };
}

export function validateMototaxiData(data: Partial<MototaxiData>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // mActivity is always required for mototaxi
  if (!data.actividad) {
    errors.push('La actividad es requerida para mototaxi');
  }

  // Propiedad is required
  if (!data.propiedad) {
    errors.push('La propiedad es requerida para mototaxi');
  }

  // Modalidad is required
  if (!data.modalidad) {
    errors.push('La modalidad es requerida para mototaxi');
  }

  // Documentos al día is required
  if (data.documentosAlDia === undefined || data.documentosAlDia === null) {
    errors.push('El estado de documentos al día es requerido para mototaxi');
  }

  // Horario is required
  if (!data.horario) {
    errors.push('El horario es requerido para mototaxi');
  }

  // If propiedad is PAGA_TARIFA, valorTarifa is required and must be > 0
  if (data.propiedad === 'PAGA_TARIFA') {
    if (data.valorTarifa === undefined || data.valorTarifa === null) {
      errors.push('El valor de tarifa es requerido cuando la propiedad es "Paga tarifa"');
    } else if (data.valorTarifa <= 0) {
      errors.push('El valor de tarifa debe ser mayor a 0');
    }
  }

  // If modalidad is ESTACION, estacionId is required
  if (data.modalidad === 'ESTACION') {
    if (!data.estacionId) {
      errors.push('La estación es requerida cuando la modalidad es "Estación"');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
