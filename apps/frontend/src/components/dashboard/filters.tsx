'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Station { id: string; nombre: string; }

interface DashboardFiltersProps {
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

export interface FilterState {
  fechaInicial: string;
  fechaFinal: string;
  tipoVehiculo: string;
  actividad: string;
  estacion: string;
  horario: string;
  documentosAlDia: string;
}

const initialFilters: FilterState = {
  fechaInicial: '', fechaFinal: '', tipoVehiculo: '',
  actividad: '', estacion: '', horario: '', documentosAlDia: '',
};

const inputClass =
  'w-full border border-gray-200 dark:border-gray-600 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors';

const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider';

export default function DashboardFilters({ onApply, onReset }: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [stations, setStations] = useState<Station[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    apiClient.get('/api/admin/estaciones')
      .then((res) => setStations((res.data || []).filter((s: any) => s.estado === 'ACTIVA')))
      .catch(() => {});
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const handleReset = () => {
    setFilters(initialFilters);
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Toggle Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtros</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
              Activos
            </span>
          )}
        </div>
        {isExpanded
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Filter Fields */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className={labelClass}>Fecha inicial</label>
              <input type="date" value={filters.fechaInicial}
                onChange={(e) => setFilters({ ...filters, fechaInicial: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha final</label>
              <input type="date" value={filters.fechaFinal}
                onChange={(e) => setFilters({ ...filters, fechaFinal: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo de vehículo</label>
              <select value={filters.tipoVehiculo}
                onChange={(e) => setFilters({ ...filters, tipoVehiculo: e.target.value })}
                className={inputClass}>
                <option value="">Todos</option>
                <option value="MOTOCICLETA">Motocicleta</option>
                <option value="MOTOCARRO">Motocarro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Actividad</label>
              <select value={filters.actividad}
                onChange={(e) => setFilters({ ...filters, actividad: e.target.value })}
                className={inputClass}>
                <option value="">Todas</option>
                <option value="MOTOTAXI">Mototaxi</option>
                <option value="FAMILIAR">Familiar</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estación</label>
              <select value={filters.estacion}
                onChange={(e) => setFilters({ ...filters, estacion: e.target.value })}
                className={inputClass}>
                <option value="">Todas</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Horario</label>
              <select value={filters.horario}
                onChange={(e) => setFilters({ ...filters, horario: e.target.value })}
                className={inputClass}>
                <option value="">Todos</option>
                <option value="DIURNO">Diurno</option>
                <option value="NOCTURNO">Nocturno</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Documentos</label>
              <select value={filters.documentosAlDia}
                onChange={(e) => setFilters({ ...filters, documentosAlDia: e.target.value })}
                className={inputClass}>
                <option value="">Todos</option>
                <option value="true">Al día</option>
                <option value="false">Sin documentos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            {hasActiveFilters && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
            <button onClick={() => onApply(filters)}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition-colors">
              <Filter className="w-3.5 h-3.5" /> Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
