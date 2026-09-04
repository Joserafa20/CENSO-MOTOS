'use client';

import { useState } from 'react';
import { Search, FileText, AlertCircle, CheckCircle, Bike, Calendar, Hash, Activity, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PublicWrapper from '../components/public-wrapper';

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

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  BORRADOR:            { label: 'En proceso',          color: 'bg-amber-100  text-amber-800  border-amber-200',  dot: 'bg-amber-500'  },
  FINALIZADO:          { label: 'Finalizado',           color: 'bg-green-100  text-green-800  border-green-200',  dot: 'bg-green-500'  },
  CERTIFICADO_GENERADO:{ label: 'Certificado generado', color: 'bg-blue-100   text-blue-800   border-blue-200',   dot: 'bg-blue-500'   },
};

function StatusBadge({ estado }: { estado: string }) {
  const s = STATUS_MAP[estado] ?? { label: estado, color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

function ConsultarPage() {
  const [placa, setPlaca] = useState('');
  const [censusInfo, setCensusInfo] = useState<CensusInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCensusInfo(null);

    const trimmed = placa.trim().toUpperCase();
    if (!trimmed) {
      setError('Ingresa el número de placa de tu vehículo');
      return;
    }

    setIsLoading(true);

    try {
      // Use Next.js proxy so the request stays same-origin
      const response = await fetch(`/api/public/censos/placa/${trimmed}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('No encontramos un censo registrado para esa placa. Verifica que sea correcta.');
        } else {
          setError('Ocurrió un error al consultar. Intenta de nuevo en un momento.');
        }
        return;
      }

      setCensusInfo(await response.json());
    } catch {
      setError('No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) =>
    tipo === 'MOTOCICLETA' ? 'Motocicleta' : 'Motocarro';

  const getActividadLabel = (actividad?: string) => {
    if (!actividad) return 'No especificada';
    return actividad === 'MOTOTAXI' ? 'Mototaxi' : 'Familiar';
  };

  return (
    <div className="max-w-xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Consulta tu censo
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
          Ingresa la placa de tu vehículo para verificar si está registrado en el censo municipal de motos de Sabanalarga.
        </p>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="placa" className="block text-sm font-semibold text-gray-700 mb-2">
              Número de placa
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="Ej: ABC-123"
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono tracking-widest text-gray-900 placeholder-gray-400 transition-colors"
                maxLength={10}
                autoComplete="off"
                autoCapitalize="characters"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Escribe exactamente como aparece en el documento del vehículo
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !placa.trim()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Consultando…
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Consultar
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Result */}
      {censusInfo && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Result header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-green-50 border-b border-green-100">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Vehículo encontrado en el censo</p>
              <p className="text-xs text-green-600">Placa <span className="font-mono font-bold">{censusInfo.placa}</span></p>
            </div>
            <div className="ml-auto">
              <StatusBadge estado={censusInfo.estado} />
            </div>
          </div>

          {/* Details */}
          <div className="px-6">
            <InfoRow
              icon={<Hash className="w-4 h-4" />}
              label="Código de censo"
              value={<span className="font-mono text-blue-600">{censusInfo.codigoCenso}</span>}
            />
            <InfoRow
              icon={<Bike className="w-4 h-4" />}
              label="Tipo de vehículo"
              value={getTipoLabel(censusInfo.tipoVehiculo)}
            />
            <InfoRow
              icon={<Activity className="w-4 h-4" />}
              label="Actividad"
              value={getActividadLabel(censusInfo.actividad)}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Fecha del censo"
              value={format(new Date(censusInfo.fechaCenso), "d 'de' MMMM 'de' yyyy", { locale: es })}
            />
          </div>

          {/* Certificate section */}
          {censusInfo.certificate ? (
            <div className="mx-6 my-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Certificado disponible</span>
              </div>
              <p className="text-xs text-blue-600 mb-1">
                Código: <span className="font-mono font-bold">{censusInfo.certificate.codigoCertificado}</span>
              </p>
              <p className="text-xs text-blue-500 mb-4">
                Generado el {format(new Date(censusInfo.certificate.fechaGeneracion), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <a
                href={`/validar/${censusInfo.certificate.codigoCertificado}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver certificado
              </a>
            </div>
          ) : (
            censusInfo.estado === 'FINALIZADO' && (
              <div className="mx-6 my-5 rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">Certificado no generado aún</span>
                </div>
                <p className="text-xs text-gray-500">
                  Tu censo está finalizado. El certificado será generado por la Alcaldía próximamente.
                </p>
              </div>
            )
          )}

          {/* Footer note */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Si la información no es correcta, comunícate con la Alcaldía de Sabanalarga.
            </p>
          </div>
        </div>
      )}

      {/* Help tip (only before search) */}
      {!censusInfo && !error && (
        <div className="mt-6 flex items-start gap-3 text-xs text-gray-400">
          <span className="text-lg leading-none">💡</span>
          <p className="leading-relaxed">
            Esta consulta es gratuita y pública. Solo necesitas la placa del vehículo.
            Si tu moto no aparece, acércate a la Alcaldía para registrarla.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ConsultarWrapper() {
  return (
    <PublicWrapper>
      <ConsultarPage />
    </PublicWrapper>
  );
}
