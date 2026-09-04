import { Propiedad } from '@prisma/client';

import {
  ValidationResult,
  RequiredFieldsResult,
} from '../types/rule-result';

interface MotocarroData {
  tipoVehiculo: 'MOTOCARRO';
  actividad?: string;
  propiedad?: Propiedad;
  documentosAlDia?: boolean;
}

export function getMotocarroRequiredFields(): RequiredFieldsResult {
  return {
    required: ['actividad', 'propiedad'],
    optional: ['documentosAlDia', 'latitud', 'longitud'],
  };
}

export function validateMotocarroData(data: Partial<MotocarroData>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Actividad is required for motocarro
  if (!data.actividad) {
    errors.push('La actividad es requerida para motocarro');
  }

  // Propiedad is required
  if (!data.propiedad) {
    errors.push('La propiedad es requerida para motocarro');
  }

  // If PAGA_TARIFA, documentosAlDia is required
  if (data.propiedad === 'PAGA_TARIFA') {
    if (data.documentosAlDia === undefined || data.documentosAlDia === null) {
      errors.push('El estado de documentos al día es requerido cuando el motocarro paga tarifa');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
