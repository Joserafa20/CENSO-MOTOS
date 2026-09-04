'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Station {
  id: string;
  nombre: string;
}

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
  fechaInicial: '',
  fechaFinal: '',
  tipoVehiculo: '',
  actividad: '',
  estacion: '',
  horario: '',
  documentosAlDia: '',
};

export default function DashboardFilters({ onApply, onReset }: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [stations, setStations] = useState<Station[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await apiClient.get('/api/admin/estaciones');
      setStations(response.data.filter((s: any) => s.estado === 'ACTIVA'));
    } catch (err) {
      console.error('Error fetching stations', err);
    }
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Activos
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Fecha Inicial
              </label>
              <input
                type="date"
                value={filters.fechaInicial}
                onChange={(e) => setFilters({ ...filters, fechaInicial: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Fecha Final
              </label>
              <input
                type="date"
                value={filters.fechaFinal}
                onChange={(e) => setFilters({ ...filters, fechaFinal: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tipo de Vehículo
              </label>
              <select
                value={filters.tipoVehiculo}
                onChange={(e) => setFilters({ ...filters, tipoVehiculo: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="MOTOCICLETA">Motocicleta</option>
                <option value="MOTOCARRO">Motocarro</option>
              </select>
            </div>

            {/* Activity */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Actividad
              </label>
              <select
                value={filters.actividad}
                onChange={(e) => setFilters({ ...filters, actividad: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="MOTOTAXI">Mototaxi</option>
                <option value="FAMILIAR">Familiar</option>
              </select>
            </div>

            {/* Station */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Estación
              </label>
              <select
                value={filters.estacion}
                onChange={(e) => setFilters({ ...filters, estacion: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todas</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Horario
              </label>
              <select
                value={filters.horario}
                onChange={(e) => setFilters({ ...filters, horario: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="DIURNO">Diurno</option>
                <option value="NOCTURNO">Nocturno</option>
              </select>
            </div>

            {/* Documents Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Documentos al Día
              </label>
              <select
                value={filters.documentosAlDia}
                onChange={(e) => setFilters({ ...filters, documentosAlDia: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </button>
            )}
            <button
              onClick={handleApply}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
