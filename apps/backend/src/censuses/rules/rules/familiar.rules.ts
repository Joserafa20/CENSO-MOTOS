import {
  ValidationResult,
  RequiredFieldsResult,
} from '../types/rule-result';

interface FamiliarData {
  tipoVehiculo: 'MOTOCICLETA';
  actividad: 'FAMILIAR';
  documentosAlDia?: boolean;
}

export function getFamiliarRequiredFields(): RequiredFieldsResult {
  return {
    required: ['documentosAlDia'],
    optional: ['latitud', 'longitud'],
  };
}

export function validateFamiliarData(data: Partial<FamiliarData>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Documentos al día is the only required field for familiar
  if (data.documentosAlDia === undefined || data.documentosAlDia === null) {
    errors.push('El estado de documentos al día es requerido para motocicleta familiar');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
