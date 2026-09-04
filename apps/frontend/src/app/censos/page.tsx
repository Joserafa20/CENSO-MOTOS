'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, Eye, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import DashboardWrapper from '../components/dashboard-wrapper';

interface Census {
  id: string;
  codigoCenso: string;
  placa: string;
  tipoVehiculo: string;
  estado: string;
  fechaCenso: string;
  estacion?: { nombre: string };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function CensosPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'ADMIN';
  const [censuses, setCensuses] = useState<Census[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCensuses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('estado', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const endpoint = isAdmin
        ? `/api/censuses/admin/all?${params.toString()}`
        : `/api/censuses?${params.toString()}`;
      const response = await apiClient.get(endpoint);
      setCensuses(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Error al cargar los censos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCensuses();
  }, [search, statusFilter, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCensuses();
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {labels[tipo] || tipo}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Censos</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona los censos de motos registrados
            </p>
          </div>
          <button
            onClick={() => router.push('/censos/nuevo')}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Censo
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por placa o código..."
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Todos los estados</option>
                <option value="BORRADOR">Borrador</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CERTIFICADO_GENERADO">Certificado</option>
              </select>
            </div>
          </form>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : censuses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">No se encontraron censos</p>
                  </td>
                </tr>
              ) : (
                censuses.map((census) => (
                  <tr
                    key={census.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/censos/${census.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {census.codigoCenso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {census.placa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTipoBadge(census.tipoVehiculo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(census.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(census.fechaCenso), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/censos/${census.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : censuses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No se encontraron censos</p>
            </div>
          ) : (
            censuses.map((census) => (
              <div
                key={census.id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/censos/${census.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-600">
                    {census.codigoCenso}
                  </span>
                  {getStatusBadge(census.estado)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{census.placa}</p>
                    <p className="text-sm text-gray-600">
                      {getTipoBadge(census.tipoVehiculo)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(census.fechaCenso), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {(meta.page - 1) * meta.limit + 1} a{' '}
              {Math.min(meta.page * meta.limit, meta.total)} de {meta.total} censos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CensosWrapper() {
  return (
    <DashboardWrapper>
      <CensosPage />
    </DashboardWrapper>
  );
}
