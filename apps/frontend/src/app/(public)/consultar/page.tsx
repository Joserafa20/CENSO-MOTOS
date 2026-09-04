'use client';

import { useState } from 'react';
import { Search, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Certificate {
  id: string;
  codigoCertificado: string;
  fechaGeneracion: string;
  estado: string;
}

interface CensusInfo {
  placa: string;
  tipoVehiculo: string;
  actividad?: string;
  estado: string;
  fechaCenso: string;
  codigoCenso: string;
  certificate?: Certificate;
}

export default function ConsultarPage() {
  const [placa, setPlaca] = useState('');
  const [censusInfo, setCensusInfo] = useState<CensusInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCensusInfo(null);

    if (!placa.trim()) {
      setError('Ingrese una placa para buscar');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/censos/placa/${placa.toUpperCase()}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('No se encontró un censo asociado a esta placa');
        } else {
          setError('Error al buscar el censo');
        }
        return;
      }

      const data = await response.json();
      setCensusInfo(data);
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/validar/${censusInfo?.certificate?.codigoCertificado}`,
      );

      if (response.ok) {
        // For public access, we'll open the validation page instead
        window.open(`/validar/${censusInfo?.certificate?.codigoCertificado}`, '_blank');
      }
    } catch (err) {
      console.error('Error downloading certificate', err);
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles: Record<string, string> = {
      BORRADOR: 'bg-yellow-100 text-yellow-800',
      FINALIZADO: 'bg-green-100 text-green-800',
      CERTIFICADO_GENERADO: 'bg-blue-100 text-blue-800',
    };

    const labels: Record<string, string> = {
      BORRADOR: 'Borrador',
      FINALIZADO: 'Finalizado',
      CERTIFICADO_GENERADO: 'Certificado Generado',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          styles[estado] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[estado] || estado}
      </span>
    );
  };

  const getTipoLabel = (tipo: string) => {
    return tipo === 'MOTOCICLETA' ? 'Motocicleta' : 'Motocarro';
  };

  const getActividadLabel = (actividad?: string) => {
    if (!actividad) return 'N/A';
    return actividad === 'MOTOTAXI' ? 'Mototaxi' : 'Familiar';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Consultar Censo por Placa
        </h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Placa
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                maxLength={10}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Buscando...
              </span>
            ) : (
              'Buscar Censo'
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Census Info */}
      {censusInfo && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm font-medium text-green-800">
                Censo encontrado
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Placa */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-500">Placa</span>
              <span className="text-lg font-bold text-gray-900 font-mono">
                {censusInfo.placa}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Código Censo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-500">Código de Censo</span>
              <span className="text-sm font-medium text-blue-600">
                {censusInfo.codigoCenso}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Tipo de Vehículo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-500">Tipo de Vehículo</span>
              <span className="text-sm text-gray-900">
                {getTipoLabel(censusInfo.tipoVehiculo)}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Actividad */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-500">Actividad</span>
              <span className="text-sm text-gray-900">
                {getActividadLabel(censusInfo.actividad)}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Fecha del Censo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-500">Fecha del Censo</span>
              <span className="text-sm text-gray-900">
                {format(new Date(censusInfo.fechaCenso), 'dd/MM/yyyy', { locale: es })}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Estado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-500">Estado</span>
              {getStatusBadge(censusInfo.estado)}
            </div>

            {/* Certificate Section */}
            {censusInfo.certificate && (
              <>
                <hr className="border-gray-200" />
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Certificado Generado
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-blue-600">Código de Certificado</span>
                      <span className="text-sm font-mono font-medium text-blue-800">
                        {censusInfo.certificate.codigoCertificado}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-blue-600">Fecha de Generación</span>
                      <span className="text-sm text-blue-800">
                        {format(new Date(censusInfo.certificate.fechaGeneracion), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
