'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValidationResponse {
  valid: boolean;
  message: string;
  certificate?: {
    codigoCertificado: string;
    fechaGeneracion: string;
    estado: string;
  };
  census?: {
    placa: string;
    tipoVehiculo: string;
    actividad?: string;
    fechaCenso: string;
    codigoCenso: string;
  };
}

export default function ValidarPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/validar/${token}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            setValidation({
              valid: false,
              message: 'Certificado no encontrado',
            });
          } else {
            setError('Error al validar el certificado');
          }
          return;
        }

        const data = await response.json();
        setValidation(data);
      } catch (err) {
        setError('Error de conexión con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const getTipoLabel = (tipo: string) => {
    return tipo === 'MOTOCICLETA' ? 'Motocicleta' : 'Motocarro';
  };

  const getActividadLabel = (actividad?: string) => {
    if (!actividad) return 'N/A';
    return actividad === 'MOTOTAXI' ? 'Mototaxi' : 'Familiar';
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Validando certificado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No disponible</h1>
          <p className="text-gray-600">No se pudo validar el certificado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full">
        {validation.valid ? (
          /* Valid Certificate */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="bg-green-50 border-b border-green-200 p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-green-800">
                CERTIFICADO VÁLIDO
              </h1>
            </div>

            {/* Certificate Info */}
            <div className="p-6 space-y-4">
              {validation.certificate && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Información del Certificado
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Código:</span>
                      <span className="font-mono font-medium text-green-800">
                        {validation.certificate.codigoCertificado}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Estado:</span>
                      <span className="font-medium text-green-800">
                        {validation.certificate.estado === 'VALIDO' ? 'Válido' : 'Anulado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Fecha:</span>
                      <span className="text-green-800">
                        {format(new Date(validation.certificate.fechaGeneracion), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {validation.census && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Información del Censo
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Placa</span>
                      <span className="text-lg font-bold text-gray-900 font-mono">
                        {validation.census.placa}
                      </span>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tipo</span>
                      <span className="text-sm text-gray-900">
                        {getTipoLabel(validation.census.tipoVehiculo)}
                      </span>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Actividad</span>
                      <span className="text-sm text-gray-900">
                        {getActividadLabel(validation.census.actividad)}
                      </span>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Fecha del Censo</span>
                      <span className="text-sm text-gray-900">
                        {format(new Date(validation.census.fechaCenso), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Código de Censo</span>
                      <span className="text-sm font-medium text-blue-600">
                        {validation.census.codigoCenso}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Invalid Certificate */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-200 p-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-red-800">
                CERTIFICADO NO VÁLIDO
              </h1>
            </div>

            {/* Error Info */}
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">{validation.message}</p>
              
              {validation.certificate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Código:</span>
                    <span className="font-mono text-gray-700">
                      {validation.certificate.codigoCertificado}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Estado:</span>
                    <span className="text-red-600 font-medium">
                      {validation.certificate.estado}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Sistema de Censo de Motos - Alcaldía Municipal de Sabanalarga</p>
        </div>
      </div>
    </div>
  );
}
