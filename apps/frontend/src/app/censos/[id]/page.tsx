'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Download,
  Edit2,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import DashboardWrapper from '../../components/dashboard-wrapper';

interface CensusDetail {
  id: string;
  codigoCenso: string;
  placa: string;
  tipoVehiculo: string;
  actividad: string | null;
  propiedad: string | null;
  modalidad: string | null;
  valorTarifa: number | null;
  estacionId: string | null;
  documentosAlDia: boolean | null;
  horario: string | null;
  estado: string;
  fechaCenso: string;
  latitud: number | null;
  longitud: number | null;
  estacion: { id: string; nombre: string } | null;
  censista: { id: string; nombre: string; username: string };
  certificate: {
    id: string;
    codigoCertificado: string;
    qrToken: string;
    fechaGeneracion: string;
    estado: string;
  } | null;
}

function CensusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [census, setCensus] = useState<CensusDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCensus(params.id as string);
    }
  }, [params.id]);

  const fetchCensus = async (id: string) => {
    try {
      const response = await apiClient.get(`/api/censuses/${id}`);
      setCensus(response.data);
    } catch (err) {
      console.error('Error fetching census', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCensus = async () => {
    if (!census) return;
    setIsApproving(true);
    try {
      const response = await apiClient.post(`/api/censuses/${census.id}/finalize`, {});
      setCensus((prev) => prev ? { ...prev, ...response.data, certificate: response.data.certificate ?? prev.certificate } : prev);
    } catch (err) {
      console.error('Error aprobando censo', err);
      alert('Error al aprobar el censo. Intenta de nuevo.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!census?.certificate) return;

    setIsDownloading(true);
    try {
      const response = await apiClient.get(
        `/api/certificates/${census.id}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificado-${census.codigoCenso}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      BORRADOR: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
      },
      FINALIZADO: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      CERTIFICADO_GENERADO: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <FileText className="w-4 h-4" />,
      },
    };

    const labels: Record<string, string> = {
      BORRADOR: 'Borrador',
      FINALIZADO: 'Finalizado',
      CERTIFICADO_GENERADO: 'Certificado Generado',
    };

    const style = styles[estado] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: <AlertCircle className="w-4 h-4" /> };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        <span className="ml-1.5">{labels[estado] || estado}</span>
      </span>
    );
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      tipoVehiculo: 'Tipo de Vehículo',
      actividad: 'Actividad',
      propiedad: 'Propiedad',
      modalidad: 'Modalidad',
      valorTarifa: 'Valor Tarifa',
      documentosAlDia: 'Documentos al Día',
      horario: 'Horario',
      estacion: 'Estación',
      censista: 'Censista',
      fechaCenso: 'Fecha del Censo',
      latitud: 'Latitud',
      longitud: 'Longitud',
    };
    return labels[field] || field;
  };

  const formatValue = (field: string, value: any) => {
    if (value === null || value === undefined) return '-';

    switch (field) {
      case 'tipoVehiculo':
        return value === 'MOTOCICLETA' ? 'Motocicleta' : 'Motocarro';
      case 'actividad':
        return value === 'MOTOTAXI' ? 'Mototaxi' : 'Familiar';
      case 'propiedad':
        return value === 'PROPIA' ? 'Propia' : 'Paga Tarifa';
      case 'modalidad':
        return value === 'ESTACION' ? 'En Estación' : 'Circulante';
      case 'horario':
        return value === 'DIURNO' ? 'Diurno' : 'Nocturno';
      case 'documentosAlDia':
        return value ? 'Sí' : 'No';
      case 'valorTarifa':
        return `$${Number(value).toLocaleString('es-CO')}`;
      case 'fechaCenso':
        return format(new Date(value), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
      default:
        return String(value);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Cargando censo...</p>
        </div>
      </div>
    );
  }

  if (!census) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Censo no encontrado</h2>
        <p className="mt-2 text-gray-600">El censo solicitado no existe o no tiene acceso.</p>
        <button
          onClick={() => router.push('/censos')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/censos')}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{census.codigoCenso}</h1>
            <p className="text-sm text-gray-600">Placa: {census.placa}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(census.estado)}
          {census.estado === 'BORRADOR' && user?.rol === 'CENSISTA' && (
            <button
              onClick={() => router.push(`/censos/${census.id}/editar`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </button>
          )}
          {census.estado === 'BORRADOR' && user?.rol === 'ADMIN' && (
            <button
              onClick={handleApproveCensus}
              disabled={isApproving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {isApproving ? 'Aprobando...' : 'Aprobar Censo'}
            </button>
          )}
          {census.certificate && user?.rol === 'ADMIN' && (
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Descargando...' : 'Descargar Certificado'}
            </button>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Información del Vehículo</h2>
        </div>
        <div className="p-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Placa" value={census.placa} highlight />
            <DetailItem label={getFieldLabel('tipoVehiculo')} value={formatValue('tipoVehiculo', census.tipoVehiculo)} />
            <DetailItem label={getFieldLabel('actividad')} value={formatValue('actividad', census.actividad)} />
            <DetailItem label={getFieldLabel('propiedad')} value={formatValue('propiedad', census.propiedad)} />
            <DetailItem label={getFieldLabel('modalidad')} value={formatValue('modalidad', census.modalidad)} />
            <DetailItem label={getFieldLabel('valorTarifa')} value={formatValue('valorTarifa', census.valorTarifa)} />
            <DetailItem label={getFieldLabel('estacion')} value={census.estacion?.nombre || '-'} />
            <DetailItem label={getFieldLabel('documentosAlDia')} value={formatValue('documentosAlDia', census.documentosAlDia)} />
            <DetailItem label={getFieldLabel('horario')} value={formatValue('horario', census.horario)} />
          </dl>
        </div>
      </div>

      {/* Census Info */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Información del Censo</h2>
        </div>
        <div className="p-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Código Censo" value={census.codigoCenso} />
            <DetailItem label={getFieldLabel('fechaCenso')} value={formatValue('fechaCenso', census.fechaCenso)} />
            <DetailItem label={getFieldLabel('censista')} value={`${census.censista.nombre} (@${census.censista.username})`} />
            {census.latitud && census.longitud && (
              <>
                <DetailItem label={getFieldLabel('latitud')} value={String(census.latitud)} />
                <DetailItem label={getFieldLabel('longitud')} value={String(census.longitud)} />
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Certificate Info */}
      {census.certificate && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Certificado</h2>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Código Certificado" value={census.certificate.codigoCertificado} />
              <DetailItem label="Fecha Generación" value={formatValue('fechaCenso', census.certificate.fechaGeneracion)} />
              <DetailItem label="Estado" value={census.certificate.estado === 'VALIDO' ? 'Válido' : 'Anulado'} />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className={`mt-1 text-sm ${highlight ? 'text-lg font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
        {value}
      </dd>
    </div>
  );
}

export default function CensusDetailWrapper() {
  return (
    <DashboardWrapper>
      <CensusDetailPage />
    </DashboardWrapper>
  );
}
