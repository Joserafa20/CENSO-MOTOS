export const VEHICLE_TYPES = {
  MOTOCICLETA: 'motocicleta',
  MOTOTAXI: 'mototaxi',
  MOTOCARRO: 'motocarro',
  CUATRIMOTO: 'cuatrimoto',
  OTRO: 'otro',
} as const;

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  [VEHICLE_TYPES.MOTOCICLETA]: 'Motocicleta',
  [VEHICLE_TYPES.MOTOTAXI]: 'Mototaxi',
  [VEHICLE_TYPES.MOTOCARRO]: 'Motocarro',
  [VEHICLE_TYPES.CUATRIMOTO]: 'Cuatrimoto',
  [VEHICLE_TYPES.OTRO]: 'Otro',
};

export const VEHICLE_USES = {
  PARTICULAR: 'particular',
  PUBLICO: 'publico',
  CARGA: 'carga',
  MIXTO: 'mixto',
  INSTITUCIONAL: 'institucional',
} as const;

export const VEHICLE_USE_LABELS: Record<string, string> = {
  [VEHICLE_USES.PARTICULAR]: 'Particular',
  [VEHICLE_USES.PUBLICO]: 'Público',
  [VEHICLE_USES.CARGA]: 'Carga',
  [VEHICLE_USES.MIXTO]: 'Mixto',
  [VEHICLE_USES.INSTITUCIONAL]: 'Institucional',
};

export const FUEL_TYPES = {
  GASOLINA: 'gasolina',
  DIESEL: 'diesel',
  ELECTRICO: 'electrico',
  HIBRIDO: 'hibrido',
  GAS: 'gas',
  OTRO: 'otro',
} as const;

export const FUEL_TYPE_LABELS: Record<string, string> = {
  [FUEL_TYPES.GASOLINA]: 'Gasolina',
  [FUEL_TYPES.DIESEL]: 'Diésel',
  [FUEL_TYPES.ELECTRICO]: 'Eléctrico',
  [FUEL_TYPES.HIBRIDO]: 'Híbrido',
  [FUEL_TYPES.GAS]: 'Gas',
  [FUEL_TYPES.OTRO]: 'Otro',
};

// Business rules for vehicle types
export const VEHICLE_TYPE_RULES: Record<string, {
  requiresLicense: boolean;
  minCylinderCapacity?: number;
  maxCylinderCapacity?: number;
  allowedUses: string[];
  requiresSOAT: boolean;
  requiresTecnomecanica: boolean;
}> = {
  [VEHICLE_TYPES.MOTOCICLETA]: {
    requiresLicense: true,
    minCylinderCapacity: 50,
    allowedUses: [VEHICLE_USES.PARTICULAR, VEHICLE_USES.PUBLICO, VEHICLE_USES.MIXTO, VEHICLE_USES.INSTITUCIONAL],
    requiresSOAT: true,
    requiresTecnomecanica: true,
  },
  [VEHICLE_TYPES.MOTOTAXI]: {
    requiresLicense: true,
    minCylinderCapacity: 125,
    allowedUses: [VEHICLE_USES.PUBLICO, VEHICLE_USES.MIXTO],
    requiresSOAT: true,
    requiresTecnomecanica: true,
  },
  [VEHICLE_TYPES.MOTOCARRO]: {
    requiresLicense: true,
    minCylinderCapacity: 150,
    allowedUses: [VEHICLE_USES.CARGA, VEHICLE_USES.MIXTO, VEHICLE_USES.PUBLICO],
    requiresSOAT: true,
    requiresTecnomecanica: true,
  },
  [VEHICLE_TYPES.CUATRIMOTO]: {
    requiresLicense: true,
    minCylinderCapacity: 200,
    allowedUses: [VEHICLE_USES.PARTICULAR, VEHICLE_USES.INSTITUCIONAL],
    requiresSOAT: true,
    requiresTecnomecanica: true,
  },
  [VEHICLE_TYPES.OTRO]: {
    requiresLicense: true,
    allowedUses: Object.values(VEHICLE_USES),
    requiresSOAT: true,
    requiresTecnomecanica: false,
  },
};

export function getVehicleTypeRules(type: string) {
  return VEHICLE_TYPE_RULES[type] ?? VEHICLE_TYPE_RULES[VEHICLE_TYPES.OTRO];
}

export function isValidVehicleUseForType(vehicleType: string, vehicleUse: string): boolean {
  const rules = getVehicleTypeRules(vehicleType);
  return rules.allowedUses.includes(vehicleUse);
}