'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '@/lib/api-client';
import DashboardFilters, { FilterState } from '@/components/dashboard/filters';
import Statistics from '@/components/dashboard/statistics';

interface DashboardStats {
  totalCensos: number;
  totalMotocicletas: number;
  totalMotocarros: number;
  totalMototaxis: number;
  totalFamiliares: number;
  mototaxisPropios: number;
  mototaxisPaganTarifa: number;
  mototaxisEstacion: number;
  mototaxisCirculantes: number;
  mototaxisDocumentosAlDia: number;
  mototaxisSinDocumentos: number;
  motocarrosPropios: number;
  motocarrosPaganTarifa: number;
  censosHoy: number;
  censosSemana: number;
}

interface RecentCensus {
  id: string;
  codigoCenso: string;
  placa: string;
  tipoVehiculo: string;
  estado: string;
  fechaCenso: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCensuses, setRecentCensuses] = useState<RecentCensus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [activeFilters]);

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilters) {
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await apiClient.get(`/api/admin/dashboard?${params.toString()}`);
      setStats(response.data);

      // Fetch recent censuses (limit 10)
      const censusesResponse = await apiClient.get('/api/censuses?limit=10');
      setRecentCensuses(censusesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    setActiveFilters(null);
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
      CERTIFICADO_GENERADO: 'Certificado',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          styles[estado] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[estado] || estado}
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      MOTOCICLETA: 'Motocicleta',
      MOTOCARRO: 'Motocarro',
    };

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {labels[tipo] || tipo}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Resumen del sistema de censo de motos
        </p>
      </div>

      {/* Filters */}
      <DashboardFilters onApply={handleApplyFilters} onReset={handleResetFilters} />

      {/* Statistics */}
      <Statistics stats={stats} isLoading={false} />

      {/* Recent Censuses */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Censos Recientes</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCensuses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No hay censos recientes
                  </td>
                </tr>
              ) : (
                recentCensuses.map((census) => (
                  <tr
                    key={census.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/censos/${census.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {census.codigoCenso}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {census.placa}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getTipoBadge(census.tipoVehiculo)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(census.estado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(census.fechaCenso), 'dd/MM/yyyy', { locale: es })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {recentCensuses.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No hay censos recientes
            </div>
          ) : (
            recentCensuses.map((census) => (
              <div
                key={census.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/censos/${census.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    {census.codigoCenso}
                  </span>
                  {getStatusBadge(census.estado)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{census.placa}</p>
                    <p className="text-xs text-gray-500">
                      {getTipoBadge(census.tipoVehiculo)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(census.fechaCenso), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
