'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Printer, Tag, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import DashboardWrapper from '../components/dashboard-wrapper';

interface ApprovedCensus {
  id: string;
  codigoCenso: string;
  placa: string;
  tipoVehiculo: string;
  actividad: string | null;
  estado: string;
  fechaCenso: string;
  censista?: { nombre: string };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function StickersPage() {
  const router = useRouter();
  const { initialized } = useAuthStore();
  const [censuses, setCensuses] = useState<ApprovedCensus[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!initialized) return;
    fetchCensuses();
  }, [search, currentPage, initialized]);

  const fetchCensuses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      // Only approved censuses
      params.append('estado', 'FINALIZADO');
      const response = await apiClient.get(`/api/censuses/admin/all?${params.toString()}`);
      setCensuses(response.data.data);
      setMeta(response.data.meta);
    } catch {
      toast.error('Error al cargar los censos aprobados');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === censuses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(censuses.map((c) => c.id)));
    }
  };

  const printSelected = () => {
    if (selected.size === 0) {
      toast.error('Seleccioná al menos un censo');
      return;
    }
    const ids = Array.from(selected).join(',');
    router.push(`/stickers/imprimir?ids=${ids}`);
  };

  const TIPO: Record<string, string> = { MOTOCICLETA: 'Moto', MOTOCARRO: 'Motocarro' };
  const ACTIVIDAD: Record<string, string> = { MOTOTAXI: 'Mototaxi', FAMILIAR: 'Familiar' };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Stickers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Censos aprobados listos para imprimir sticker
          </p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={printSelected}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir {selected.size} sticker{selected.size !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchCensuses(); }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por placa o código..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : censuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No hay censos aprobados</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Los stickers se generan una vez el ADMIN aprueba el censo</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/40">
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selected.size === censuses.length && censuses.length > 0}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    {['Código', 'Placa', 'Tipo', 'Actividad', 'Fecha', 'Acciones'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {censuses.map((c) => (
                    <tr
                      key={c.id}
                      className={`transition-colors ${selected.has(c.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">{c.codigoCenso}</td>
                      <td className="px-4 py-3 text-sm font-extrabold text-gray-900 dark:text-white tracking-widest">{c.placa}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {TIPO[c.tipoVehiculo] ?? c.tipoVehiculo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {c.actividad ? (ACTIVIDAD[c.actividad] ?? c.actividad) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(c.fechaCenso), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/stickers/imprimir?ids=${c.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Sticker
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {meta.total} censos aprobados
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {currentPage} / {meta.totalPages}
                  </span>
                  <button
                    disabled={currentPage === meta.totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function StickersWrapper() {
  return (
    <DashboardWrapper>
      <StickersPage />
    </DashboardWrapper>
  );
}
