import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 (redirect to login)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// Typed API methods
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/api/auth/login', { username, password }),

  logout: () => apiClient.post('/api/auth/logout'),

  getMe: () => apiClient.get('/api/auth/me'),
};

export const censusesApi = {
  create: (data: {
    placa: string;
    tipoVehiculo: string;
    actividad?: string;
    propiedad?: string;
    modalidad?: string;
    valorTarifa?: number;
    estacionId?: string;
    documentosAlDia?: boolean;
    horario?: string;
  }) => apiClient.post('/api/censuses', data),

  findAll: (params?: {
    estado?: string;
    search?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.estado) searchParams.append('estado', params.estado);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.fechaDesde) searchParams.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) searchParams.append('fechaHasta', params.fechaHasta);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    return apiClient.get(`/api/censuses?${searchParams.toString()}`);
  },

  findOne: (id: string) => apiClient.get(`/api/censuses/${id}`),

  update: (
    id: string,
    data: Partial<{
      placa: string;
      tipoVehiculo: string;
      actividad: string;
      propiedad: string;
      modalidad: string;
      valorTarifa: number;
      estacionId: string;
      documentosAlDia: boolean;
      horario: string;
    }>,
  ) => apiClient.put(`/api/censuses/${id}`, data),

  finalize: (id: string) => apiClient.post(`/api/censuses/${id}/finalize`),
};

export const usersApi = {
  findAll: () => apiClient.get('/api/users'),

  findOne: (id: string) => apiClient.get(`/api/users/${id}`),

  create: (data: {
    nombre: string;
    documento: string;
    username: string;
    password: string;
    rol: string;
  }) => apiClient.post('/api/users', data),

  update: (
    id: string,
    data: Partial<{
      nombre: string;
      documento: string;
      username: string;
      password: string;
      rol: string;
    }>,
  ) => apiClient.put(`/api/users/${id}`, data),

  updateStatus: (id: string, estado: boolean) =>
    apiClient.patch(`/api/users/${id}/status`, { estado }),
};

export const dashboardApi = {
  getStats: (params?: {
    fechaInicial?: string;
    fechaFinal?: string;
    tipoVehiculo?: string;
    actividad?: string;
    estacion?: string;
    horario?: string;
    documentosAlDia?: boolean;
    censistaId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.fechaInicial) searchParams.append('fechaInicial', params.fechaInicial);
    if (params?.fechaFinal) searchParams.append('fechaFinal', params.fechaFinal);
    if (params?.tipoVehiculo) searchParams.append('tipoVehiculo', params.tipoVehiculo);
    if (params?.actividad) searchParams.append('actividad', params.actividad);
    if (params?.estacion) searchParams.append('estacion', params.estacion);
    if (params?.horario) searchParams.append('horario', params.horario);
    if (params?.documentosAlDia !== undefined) searchParams.append('documentosAlDia', String(params.documentosAlDia));
    if (params?.censistaId) searchParams.append('censistaId', params.censistaId);
    return apiClient.get(`/api/admin/dashboard?${searchParams.toString()}`);
  },

  getEstadisticas: (params?: {
    fechaInicial?: string;
    fechaFinal?: string;
    tipoVehiculo?: string;
    actividad?: string;
    estacion?: string;
    horario?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.fechaInicial) searchParams.append('fechaInicial', params.fechaInicial);
    if (params?.fechaFinal) searchParams.append('fechaFinal', params.fechaFinal);
    if (params?.tipoVehiculo) searchParams.append('tipoVehiculo', params.tipoVehiculo);
    if (params?.actividad) searchParams.append('actividad', params.actividad);
    if (params?.estacion) searchParams.append('estacion', params.estacion);
    if (params?.horario) searchParams.append('horario', params.horario);
    return apiClient.get(`/api/admin/dashboard/estadisticas?${searchParams.toString()}`);
  },
};

export const stationsApi = {
  findAll: () => apiClient.get('/api/admin/estaciones'),

  create: (data: { nombre: string; ubicacion: string; observaciones?: string }) =>
    apiClient.post('/api/admin/estaciones', data),

  update: (id: string, data: { nombre?: string; ubicacion?: string; observaciones?: string }) =>
    apiClient.put(`/api/admin/estaciones/${id}`, data),

  toggleStatus: (id: string) => apiClient.patch(`/api/admin/estaciones/${id}/estado`),
};

export const censistasApi = {
  findAll: () => apiClient.get('/api/admin/censistas'),

  create: (data: { nombre: string; documento: string; username: string; password: string }) =>
    apiClient.post('/api/admin/censistas', data),

  update: (
    id: string,
    data: Partial<{ nombre: string; documento: string; username: string; password: string }>,
  ) => apiClient.put(`/api/admin/censistas/${id}`, data),

  toggleStatus: (id: string) => apiClient.patch(`/api/admin/censistas/${id}/status`),
};
