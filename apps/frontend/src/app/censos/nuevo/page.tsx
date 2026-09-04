'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import DashboardWrapper from '../../components/dashboard-wrapper';

const step1Schema = z.object({
  placa: z
    .string()
    .min(3, 'La placa debe tener al menos 3 caracteres')
    .max(10, 'La placa no puede tener más de 10 caracteres')
    .regex(/^[A-Z0-9]+$/, 'La placa solo debe contener letras mayúsculas y números'),
  tipoVehiculo: z.enum(['MOTOCICLETA', 'MOTOCARRO'], {
    message: 'Seleccione un tipo de vehículo',
  }),
  actividad: z.string().optional(),
}).refine(
  (data) => {
    if (data.tipoVehiculo === 'MOTOCICLETA') {
      return data.actividad !== undefined && data.actividad !== '';
    }
    return true;
  },
  {
    message: 'La actividad es requerida para motocicleta',
    path: ['actividad'],
  }
);

type Step1Data = z.infer<typeof step1Schema>;

const step2Schema = z.object({
  propiedad: z.string().optional(),
  modalidad: z.string().optional(),
  valorTarifa: z.number().optional(),
  estacionId: z.string().optional(),
  estacionNombre: z.string().optional(),
  documentosAlDia: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    },
    z.boolean().optional(),
  ),
  horario: z.string().optional(),
}).refine(
  (data) => {
    if (data.propiedad === 'PAGA_TARIFA') {
      return data.valorTarifa !== undefined && data.valorTarifa > 0;
    }
    return true;
  },
  {
    message: 'El valor de tarifa es requerido y debe ser mayor a 0',
    path: ['valorTarifa'],
  }
).refine(
  (data) => {
    if (data.modalidad === 'ESTACION') {
      return data.estacionId !== undefined && data.estacionId !== '';
    }
    return true;
  },
  {
    message: 'La estación es requerida cuando la modalidad es Estación',
    path: ['estacionId'],
  }
);

type Step2Data = z.infer<typeof step2Schema>;

interface Station { id: string; nombre: string; }

function NuevoCensoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [estacionInput, setEstacionInput] = useState('');

  useEffect(() => {
    apiClient.get('/api/admin/estaciones').then((res) => {
      setStations(res.data || []);
    }).catch(() => {});
  }, []);

  // Step 1 form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      placa: '',
      tipoVehiculo: undefined,
      actividad: undefined,
    },
  });

  // Step 2 form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      propiedad: undefined,
      modalidad: undefined,
      valorTarifa: undefined,
      estacionId: undefined,
      documentosAlDia: undefined,
      horario: undefined,
    },
  });

  const selectedTipo = step1Form.watch('tipoVehiculo');

  const handleStep1Submit = async (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!step1Data || !step2Data) return;

    setIsSubmitting(true);
    try {
      const payload = {
        placa: step1Data.placa,
        tipoVehiculo: step1Data.tipoVehiculo,
        actividad: step1Data.actividad || undefined,
        propiedad: step2Data.propiedad || undefined,
        modalidad: step2Data.modalidad || undefined,
        valorTarifa: step2Data.valorTarifa || undefined,
        estacionId: step2Data.estacionId || undefined,
        documentosAlDia: step2Data.documentosAlDia,
        horario: step2Data.horario || undefined,
      };

      const response = await apiClient.post('/api/censuses', payload);
      toast.success(`Censo ${response.data.codigoCenso} creado exitosamente`);
      router.push(`/censos/${response.data.id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al crear el censo';
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResumen = () => {
    if (!step1Data || !step2Data) return null;

    const tipoLabels: Record<string, string> = {
      MOTOCICLETA: 'Motocicleta',
      MOTOCARRO: 'Motocarro',
    };

    const actividadLabels: Record<string, string> = {
      MOTOTAXI: 'Mototaxi',
      FAMILIAR: 'Familiar',
    };

    const propiedadLabels: Record<string, string> = {
      PROPIA: 'Propia',
      PAGA_TARIFA: 'Paga Tarifa',
    };

    const modalidadLabels: Record<string, string> = {
      ESTACION: 'Estación',
      CIRCULANTE: 'Circulante',
    };

    const horarioLabels: Record<string, string> = {
      DIURNO: 'Diurno',
      NOCTURNO: 'Nocturno',
    };

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Información del Vehículo</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Placa</dt>
              <dd className="font-medium text-gray-900">{step1Data.placa}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Tipo</dt>
              <dd className="font-medium text-gray-900">
                {tipoLabels[step1Data.tipoVehiculo] || step1Data.tipoVehiculo}
              </dd>
            </div>
            {step1Data.actividad && (
              <div>
                <dt className="text-gray-500">Actividad</dt>
                <dd className="font-medium text-gray-900">
                  {actividadLabels[step1Data.actividad] || step1Data.actividad}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {step2Data.propiedad && (
              <div>
                <dt className="text-gray-500">Propiedad</dt>
                <dd className="font-medium text-gray-900">
                  {propiedadLabels[step2Data.propiedad] || step2Data.propiedad}
                </dd>
              </div>
            )}
            {step2Data.modalidad && (
              <div>
                <dt className="text-gray-500">Modalidad</dt>
                <dd className="font-medium text-gray-900">
                  {modalidadLabels[step2Data.modalidad] || step2Data.modalidad}
                </dd>
              </div>
            )}
            {step2Data.valorTarifa && (
              <div>
                <dt className="text-gray-500">Valor Tarifa</dt>
                <dd className="font-medium text-gray-900">
                  ${step2Data.valorTarifa.toLocaleString()}
                </dd>
              </div>
            )}
            {step2Data.documentosAlDia !== undefined && (
              <div>
                <dt className="text-gray-500">Documentos al Día</dt>
                <dd className="font-medium text-gray-900">
                  {step2Data.documentosAlDia ? 'Sí' : 'No'}
                </dd>
              </div>
            )}
            {step2Data.horario && (
              <div>
                <dt className="text-gray-500">Horario</dt>
                <dd className="font-medium text-gray-900">
                  {horarioLabels[step2Data.horario] || step2Data.horario}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Censo</h1>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep > step
                      ? 'bg-green-500 text-white'
                      : currentStep === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Básico</span>
            <span>Detalles</span>
            <span>Revisión</span>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Información Básica
            </h2>
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
              <div>
                <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-2">
                  Placa del Vehículo
                </label>
                <input
                  id="placa"
                  type="text"
                  {...step1Form.register('placa', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 uppercase"
                  placeholder="Ej: ABC123"
                  maxLength={10}
                />
                {step1Form.formState.errors.placa && (
                  <p className="mt-1 text-sm text-red-600">
                    {step1Form.formState.errors.placa.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tipoVehiculo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vehículo
                </label>
                <select
                  id="tipoVehiculo"
                  {...step1Form.register('tipoVehiculo')}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="MOTOCICLETA">Motocicleta</option>
                  <option value="MOTOCARRO">Motocarro</option>
                </select>
                {step1Form.formState.errors.tipoVehiculo && (
                  <p className="mt-1 text-sm text-red-600">
                    {step1Form.formState.errors.tipoVehiculo.message}
                  </p>
                )}
              </div>

              {selectedTipo === 'MOTOCICLETA' && (
                <div>
                  <label htmlFor="actividad" className="block text-sm font-medium text-gray-700 mb-2">
                    Actividad
                  </label>
                  <select
                    id="actividad"
                    {...step1Form.register('actividad')}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                  >
                    <option value="">Seleccionar actividad</option>
                    <option value="MOTOTAXI">Mototaxi</option>
                    <option value="FAMILIAR">Familiar</option>
                  </select>
                  {step1Form.formState.errors.actividad && (
                    <p className="mt-1 text-sm text-red-600">
                      {step1Form.formState.errors.actividad.message}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                Siguiente
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Detalles del Vehículo
            </h2>
            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
              {/* Conditional fields based on vehicle type and activity */}
              {step1Data?.tipoVehiculo === 'MOTOCICLETA' && step1Data?.actividad === 'MOTOTAXI' && (
                <>
                  <div>
                    <label htmlFor="propiedad" className="block text-sm font-medium text-gray-700 mb-2">
                      Propiedad
                    </label>
                    <select
                      id="propiedad"
                      {...step2Form.register('propiedad')}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                    >
                      <option value="">Seleccionar propiedad</option>
                      <option value="PROPIA">Propia</option>
                      <option value="PAGA_TARIFA">Paga Tarifa</option>
                    </select>
                    {step2Form.formState.errors.propiedad && (
                      <p className="mt-1 text-sm text-red-600">
                        {step2Form.formState.errors.propiedad.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700 mb-2">
                      Modalidad
                    </label>
                    <select
                      id="modalidad"
                      {...step2Form.register('modalidad')}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                    >
                      <option value="">Seleccionar modalidad</option>
                      <option value="ESTACION">Estación</option>
                      <option value="CIRCULANTE">Circulante</option>
                    </select>
                    {step2Form.formState.errors.modalidad && (
                      <p className="mt-1 text-sm text-red-600">
                        {step2Form.formState.errors.modalidad.message}
                      </p>
                    )}
                  </div>

                  {step2Form.watch('propiedad') === 'PAGA_TARIFA' && (
                    <div>
                      <label htmlFor="valorTarifa" className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Tarifa
                      </label>
                      <input
                        id="valorTarifa"
                        type="number"
                        {...step2Form.register('valorTarifa', { valueAsNumber: true })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                        placeholder="Ingrese el valor"
                        min="0.01"
                        step="0.01"
                      />
                      {step2Form.formState.errors.valorTarifa && (
                        <p className="mt-1 text-sm text-red-600">
                          {step2Form.formState.errors.valorTarifa.message}
                        </p>
                      )}
                    </div>
                  )}

                  {step2Form.watch('modalidad') === 'ESTACION' && (
                    <div>
                      <label htmlFor="estacionInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estación
                      </label>
                      <input
                        id="estacionInput"
                        type="text"
                        list="estaciones-list"
                        value={estacionInput}
                        onChange={(e) => {
                          setEstacionInput(e.target.value);
                          const match = stations.find(
                            (s) => s.nombre.toLowerCase() === e.target.value.toLowerCase(),
                          );
                          step2Form.setValue('estacionId', match?.id ?? undefined);
                          step2Form.setValue('estacionNombre', e.target.value);
                        }}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        placeholder="Escriba el nombre de la estación"
                        autoComplete="off"
                      />
                      <datalist id="estaciones-list">
                        {stations.map((s) => (
                          <option key={s.id} value={s.nombre} />
                        ))}
                      </datalist>
                      {step2Form.formState.errors.estacionId && (
                        <p className="mt-1 text-sm text-red-600">
                          {step2Form.formState.errors.estacionId.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="documentosAlDia" className="block text-sm font-medium text-gray-700 mb-2">
                      Documentos al Día
                    </label>
                    <select
                      id="documentosAlDia"
                      {...step2Form.register('documentosAlDia')}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    >
                      <option value="">Seleccionar</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                    {step2Form.formState.errors.documentosAlDia && (
                      <p className="mt-1 text-sm text-red-600">
                        {step2Form.formState.errors.documentosAlDia.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-2">
                      Horario
                    </label>
                    <select
                      id="horario"
                      {...step2Form.register('horario')}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                    >
                      <option value="">Seleccionar horario</option>
                      <option value="DIURNO">Diurno</option>
                      <option value="NOCTURNO">Nocturno</option>
                    </select>
                    {step2Form.formState.errors.horario && (
                      <p className="mt-1 text-sm text-red-600">
                        {step2Form.formState.errors.horario.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {step1Data?.tipoVehiculo === 'MOTOCICLETA' && step1Data?.actividad === 'FAMILIAR' && (
                <div>
                  <label htmlFor="documentosAlDia" className="block text-sm font-medium text-gray-700 mb-2">
                    Documentos al Día
                  </label>
                  <select
                    id="documentosAlDia"
                    {...step2Form.register('documentosAlDia', {
                      valueAsNumber: false,
                    })}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                  >
                    <option value="">Seleccionar</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                  {step2Form.formState.errors.documentosAlDia && (
                    <p className="mt-1 text-sm text-red-600">
                      {step2Form.formState.errors.documentosAlDia.message}
                    </p>
                  )}
                </div>
              )}

              {step1Data?.tipoVehiculo === 'MOTOCARRO' && (
                <>
                  <div>
                    <label htmlFor="actividad-motocarro" className="block text-sm font-medium text-gray-700 mb-2">
                      Actividad
                    </label>
                    <input
                      id="actividad-motocarro"
                      type="text"
                      {...step2Form.register('actividad' as any)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                      placeholder="Describa la actividad"
                    />
                  </div>

                  <div>
                    <label htmlFor="propiedad" className="block text-sm font-medium text-gray-700 mb-2">
                      Propiedad
                    </label>
                    <select
                      id="propiedad"
                      {...step2Form.register('propiedad')}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                    >
                      <option value="">Seleccionar propiedad</option>
                      <option value="PROPIA">Propia</option>
                      <option value="PAGA_TARIFA">Paga Tarifa</option>
                    </select>
                    {step2Form.formState.errors.propiedad && (
                      <p className="mt-1 text-sm text-red-600">
                        {step2Form.formState.errors.propiedad.message}
                      </p>
                    )}
                  </div>

                  {step2Form.watch('propiedad') === 'PAGA_TARIFA' && (
                    <div>
                      <label htmlFor="documentosAlDia" className="block text-sm font-medium text-gray-700 mb-2">
                        Documentos al Día
                      </label>
                      <select
                        id="documentosAlDia"
                        {...step2Form.register('documentosAlDia', {
                          valueAsNumber: false,
                        })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
                      >
                        <option value="">Seleccionar</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                      {step2Form.formState.errors.documentosAlDia && (
                        <p className="mt-1 text-sm text-red-600">
                          {step2Form.formState.errors.documentosAlDia.message}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 h-12 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Anterior
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  Siguiente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Revisión del Censo
            </h2>
            {getResumen()}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Una vez finalizado, el censo no podrá ser modificado.
                Verifique que toda la información sea correcta.
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 h-12 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Editar
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando...
                  </span>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Crear Censo
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NuevoCensoWrapper() {
  return (
    <DashboardWrapper>
      <NuevoCensoPage />
    </DashboardWrapper>
  );
}
