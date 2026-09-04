'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Edit2, UserCheck, UserX, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '@/lib/api-client';
import DashboardWrapper from '../components/dashboard-wrapper';

interface Censista {
  id: string;
  nombre: string;
  documento: string;
  username: string;
  rol: string;
  estado: boolean;
  createdAt: string;
  totalCensos: number;
  ultimoCenso: string | null;
}

interface CensistaFormData {
  nombre: string;
  documento: string;
  username: string;
  password: string;
}

function CensistasPage() {
  const [censistas, setCensistas] = useState<Censista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCensista, setEditingCensista] = useState<Censista | null>(null);
  const [formData, setFormData] = useState<CensistaFormData>({
    nombre: '',
    documento: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCensistas();
  }, []);

  const fetchCensistas = async () => {
    try {
      const response = await apiClient.get('/api/admin/censistas');
      setCensistas(response.data);
    } catch (err) {
      console.error('Error fetching censistas', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCensista) {
        const updateData: any = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await apiClient.put(`/api/admin/censistas/${editingCensista.id}`, updateData);
      } else {
        await apiClient.post('/api/admin/censistas', formData);
      }
      setShowModal(false);
      setEditingCensista(null);
      setFormData({ nombre: '', documento: '', username: '', password: '' });
      fetchCensistas();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el censista');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await apiClient.patch(`/api/admin/censistas/${id}/status`);
      fetchCensistas();
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };

  const openCreateModal = () => {
    setEditingCensista(null);
    setFormData({ nombre: '', documento: '', username: '', password: '' });
    setShowModal(true);
  };

  const openEditModal = (censista: Censista) => {
    setEditingCensista(censista);
    setFormData({
      nombre: censista.nombre,
      documento: censista.documento,
      username: censista.username,
      password: '',
    });
    setShowModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Cargando censistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Censistas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestión de censistas del sistema
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Censista
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Censos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Censo
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {censistas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay censistas registrados
                </td>
              </tr>
            ) : (
              censistas.map((censista) => (
                <tr key={censista.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{censista.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {censista.documento}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {censista.username}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {censista.estado ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {censista.totalCensos}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(censista.ultimoCenso)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(censista)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(censista.id)}
                      className={censista.estado ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {censista.estado ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
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
        {censistas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay censistas registrados
          </div>
        ) : (
          censistas.map((censista) => (
            <div key={censista.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">{censista.nombre}</p>
                    <p className="text-xs text-gray-500">@{censista.username}</p>
                  </div>
                </div>
                {censista.estado ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div>
                  <span className="text-gray-400">Documento:</span>
                  <span className="ml-1 font-medium text-gray-700">{censista.documento}</span>
                </div>
                <div>
                  <span className="text-gray-400">Censos:</span>
                  <span className="ml-1 font-semibold text-gray-900">{censista.totalCensos}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Último censo:</span>
                  <span className="ml-1 font-medium text-gray-700">{formatDate(censista.ultimoCenso)}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 border-t pt-3">
                <button
                  onClick={() => openEditModal(censista)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggleStatus(censista.id)}
                  className={`px-3 py-1 text-sm rounded ${
                    censista.estado
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {censista.estado ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            />
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCensista ? 'Editar Censista' : 'Nuevo Censista'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.documento}
                      onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {editingCensista ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                    </label>
                    <input
                      type="password"
                      required={!editingCensista}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingCensista ? 'Guardar Cambios' : 'Crear Censista'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CensistasWrapper() {
  return (
    <DashboardWrapper>
      <CensistasPage />
    </DashboardWrapper>
  );
}
