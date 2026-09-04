'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';
import DashboardFilters, { FilterState } from '@/components/dashboard/filters';
import Statistics from '@/components/dashboard/statistics';
import DashboardWrapper from './components/dashboard-wrapper';
import { useAuthStore } from '@/stores/auth-store';

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

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  BORRADOR: { label: 'Borrador', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  FINALIZADO: { label: 'Finalizado', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CERTIFICADO_GENERADO: { label: 'Certificado', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const TIPO_CONFIG: Record<string, { label: string; classes: string }> = {
  MOTOCICLETA: { label: 'Motocicleta', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  MOTOCARRO: { label: 'Motocarro', classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
};

function Badge({ config }: { config: { label: string; classes: string } }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}

function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
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
      const [dashRes, censusRes] = await Promise.all([
        apiClient.get(`/api/admin/dashboard?${params.toString()}`),
        apiClient.get('/api/censuses?limit=10'),
      ]);
      setStats(dashRes.data);
      setRecentCensuses(censusRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{todayCapitalized}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenido, {user?.nombre?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Resumen del sistema de censo de motos — Sabanalarga
          </p>
        </div>
        <button
          onClick={() => router.push('/censos/nuevo')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Censo
        </button>
      </div>

      {/* Filters */}
      <DashboardFilters
        onApply={(f) => setActiveFilters(f)}
        onReset={() => setActiveFilters(null)}
      />

      {/* Statistics */}
      <Statistics stats={stats} isLoading={false} />

      {/* Recent Censuses */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Censos Recientes</h2>
          <button
            onClick={() => router.push('/censos')}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placa</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentCensuses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    No hay censos registrados aún.
                  </td>
                </tr>
              ) : (
                recentCensuses.map((census) => (
                  <tr
                    key={census.id}
                    onClick={() => router.push(`/censos/${census.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {census.codigoCenso}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {census.placa}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge config={TIPO_CONFIG[census.tipoVehiculo] ?? { label: census.tipoVehiculo, classes: 'bg-gray-100 text-gray-600' }} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge config={STATUS_CONFIG[census.estado] ?? { label: census.estado, classes: 'bg-gray-100 text-gray-600' }} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(census.fechaCenso), 'dd/MM/yyyy', { locale: es })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {recentCensuses.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No hay censos registrados aún.
            </div>
          ) : (
            recentCensuses.map((census) => (
              <div
                key={census.id}
                onClick={() => router.push(`/censos/${census.id}`)}
                className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{census.codigoCenso}</span>
                  <Badge config={STATUS_CONFIG[census.estado] ?? { label: census.estado, classes: 'bg-gray-100 text-gray-600' }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{census.placa}</p>
                    <Badge config={TIPO_CONFIG[census.tipoVehiculo] ?? { label: census.tipoVehiculo, classes: 'bg-gray-100 text-gray-600' }} />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
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

export default function Home() {
  return (
    <DashboardWrapper>
      <DashboardPage />
    </DashboardWrapper>
  );
}
