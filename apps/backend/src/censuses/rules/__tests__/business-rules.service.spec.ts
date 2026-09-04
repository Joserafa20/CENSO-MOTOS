import { BusinessRulesService } from '../business-rules.service';

describe('BusinessRulesService', () => {
  let service: BusinessRulesService;

  beforeEach(() => {
    service = new BusinessRulesService();
  });

  describe('Mototaxi validation', () => {
    it('should require all mototaxi fields', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCICLETA',
        actividad: 'MOTOTAXI',
        propiedad: null,
        modalidad: null,
        documentosAlDia: null,
        horario: null,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require valorTarifa when propiedad is PAGA_TARIFA', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCICLETA',
        actividad: 'MOTOTAXI',
        propiedad: 'PAGA_TARIFA',
        modalidad: 'CIRCULANTE',
        documentosAlDia: true,
        horario: 'DIURNO',
        valorTarifa: null,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('tarifa'))).toBe(true);
    });

    it('should require estacionId when modalidad is ESTACION', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCICLETA',
        actividad: 'MOTOTAXI',
        propiedad: 'PROPIA',
        modalidad: 'ESTACION',
        documentosAlDia: true,
        horario: 'DIURNO',
        estacionId: null,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('estación'))).toBe(true);
    });

    it('should pass with all valid mototaxi fields', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCICLETA',
        actividad: 'MOTOTAXI',
        propiedad: 'PROPIA',
        modalidad: 'CIRCULANTE',
        documentosAlDia: true,
        horario: 'DIURNO',
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Familiar validation', () => {
    it('should only require documentosAlDia', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCICLETA',
        actividad: 'FAMILIAR',
        documentosAlDia: true,
      });
      expect(result.isValid).toBe(true);
    });

    it('should fail if documentosAlDia is missing', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCICLETA',
        actividad: 'FAMILIAR',
        documentosAlDia: null,
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('Motocarro validation', () => {
    it('should require actividad and propiedad', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCARRO',
        actividad: null,
        propiedad: null,
      });
      expect(result.isValid).toBe(false);
    });

    it('should require documentosAlDia when PAGA_TARIFA', () => {
      const result = service.validateCensus({
        tipoVehiculo: 'MOTOCARRO',
        actividad: 'TRANSPORTE',
        propiedad: 'PAGA_TARIFA',
        documentosAlDia: null,
      });
      expect(result.isValid).toBe(false);
    });
  });
});