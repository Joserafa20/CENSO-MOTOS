import { Injectable } from '@nestjs/common';

import {
  ValidationResult,
  RequiredFieldsResult,
} from './types/rule-result';
import {
  getMototaxiRequiredFields,
  validateMototaxiData,
} from './rules/mototaxi.rules';
import {
  getMotocarroRequiredFields,
  validateMotocarroData,
} from './rules/motocarro.rules';
import {
  getFamiliarRequiredFields,
  validateFamiliarData,
} from './rules/familiar.rules';

@Injectable()
export class BusinessRulesService {
  evaluateCensusRules(
    tipoVehiculo: string,
    actividad?: string,
  ): RequiredFieldsResult {
    if (tipoVehiculo === 'MOTOCICLETA') {
      if (actividad === 'MOTOTAXI') {
        return getMototaxiRequiredFields();
      }
      if (actividad === 'FAMILIAR') {
        return getFamiliarRequiredFields();
      }
    }

    if (tipoVehiculo === 'MOTOCARRO') {
      return getMotocarroRequiredFields();
    }

    return { required: [], optional: [] };
  }

  validateCensus(censusData: {
    tipoVehiculo: string;
    actividad?: string;
    propiedad?: string;
    modalidad?: string;
    valorTarifa?: number;
    estacionNombre?: string;
    documentosAlDia?: boolean;
    horario?: string;
  }): ValidationResult {
    const { tipoVehiculo, actividad } = censusData;

    if (tipoVehiculo === 'MOTOCICLETA') {
      if (actividad === 'MOTOTAXI') {
        return validateMototaxiData(censusData as any);
      }
      if (actividad === 'FAMILIAR') {
        return validateFamiliarData(censusData as any);
      }
      // If no valid actividad, return error
      return {
        isValid: false,
        errors: ['Actividad inválida para motocicleta. Debe ser MOTOTAXI o FAMILIAR'],
        warnings: [],
      };
    }

    if (tipoVehiculo === 'MOTOCARRO') {
      return validateMotocarroData(censusData as any);
    }

    return {
      isValid: false,
      errors: ['Tipo de vehículo inválido'],
      warnings: [],
    };
  }
}
