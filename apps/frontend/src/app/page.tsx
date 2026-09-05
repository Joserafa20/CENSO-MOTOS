'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Plus, ArrowRight, FileText, Bike, Car, Users,
  TrendingUp, Clock, CheckCircle, XCircle, MapPin,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import DashboardFilters, { FilterState } from '@/components/dashboard/filters';
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
  totalDocumentosAlDia: number;
  totalSinDocumentos: number;
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

const ZERO_STATS: DashboardStats = {
  totalCensos: 0, totalMotocicletas: 0, totalMotocarros: 0,
  totalMototaxis: 0, totalFamiliares: 0, mototaxisPropios: 0,
  mototaxisPaganTarifa: 0, mototaxisEstacion: 0, mototaxisCirculantes: 0,
  mototaxisDocumentosAlDia: 0, mototaxisSinDocumentos: 0,
  totalDocumentosAlDia: 0, totalSinDocumentos: 0,
  motocarrosPropios: 0, motocarrosPaganTarifa: 0,
  censosHoy: 0, censosSemana: 0,
};

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  BORRADOR: { label: 'Borrador', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  FINALIZADO: { label: 'Finalizado', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CERTIFICADO_GENERADO: { label: 'Certificado', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const TIPO_CONFIG: Record<string, { label: string; classes: string }> = {
  MOTOCICLETA: { label: 'Moto', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  MOTOCARRO: { label: 'Motocarro', classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
};

function Badge({ config }: { config: { label: string; classes: string } }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}

function KpiCard({
  title, value, sub, icon, accentColor, bgColor, iconColor,
}: {
  title: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-t-4 ${accentColor} overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 truncate">{sub}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-2xl flex-shrink-0 ml-3`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CardShell({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCensuses, setRecentCensuses] = useState<RecentCensus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  useEffect(() => { fetchData(); }, [activeFilters]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilters) {
        Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      }
      const [dashRes, censusRes] = await Promise.all([
        apiClient.get(`/api/admin/dashboard?${params.toString()}`),
        apiClient.get('/api/censuses?limit=8'),
      ]);
      setStats(dashRes.data ?? ZERO_STATS);
      setRecentCensuses(censusRes.data?.data || []);
    } catch {
      setStats(ZERO_STATS);
    } finally {
      setIsLoading(false);
    }
  };

  const s = stats ?? ZERO_STATS;
  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);
  const firstName = user?.nombre?.split(' ')[0] ?? 'Admin';

  return (
    <div className="space-y-6 pb-20 lg:pb-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">{todayCap}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Bienvenido, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Panel de administración — Alcaldía de Sabanalarga
          </p>
        </div>
        <button
          onClick={() => router.push('/censos/nuevo')}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Censo
        </button>
      </div>

      {/* ── Filters ── */}
      <DashboardFilters onApply={(f) => setActiveFilters(f)} onReset={() => setActiveFilters(null)} />

      {/* ── KPI Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Censos"
            value={s.totalCensos}
            sub={`${s.censosHoy} hoy · ${s.censosSemana} esta semana`}
            icon={<FileText className="w-6 h-6" />}
            accentColor="border-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <KpiCard
            title="Motocicletas"
            value={s.totalMotocicletas}
            sub={`${s.totalMototaxis} mototaxis · ${s.totalFamiliares} familiares`}
            icon={<Bike className="w-6 h-6" />}
            accentColor="border-emerald-500"
            bgColor="bg-emerald-50 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <KpiCard
            title="Motocarros"
            value={s.totalMotocarros}
            sub={`${s.motocarrosPropios} propios · ${s.motocarrosPaganTarifa} pagan tarifa`}
            icon={<Car className="w-6 h-6" />}
            accentColor="border-violet-500"
            bgColor="bg-violet-50 dark:bg-violet-900/30"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <KpiCard
            title="Hoy"
            value={s.censosHoy}
            sub={`${s.censosSemana} censos esta semana`}
            icon={<TrendingUp className="w-6 h-6" />}
            accentColor="border-orange-500"
            bgColor="bg-orange-50 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
          />
        </div>
      )}

      {/* ── Middle Row ── */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Mototaxis breakdown */}
          <CardShell
            title="Mototaxis"
            icon={<span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />}
          >
            <div className="space-y-4">
              <ProgressRow label="Propios" value={s.mototaxisPropios} total={s.totalMototaxis} color="bg-blue-500" />
              <ProgressRow label="Pagan Tarifa" value={s.mototaxisPaganTarifa} total={s.totalMototaxis} color="bg-orange-500" />
              <ProgressRow label="En Estación" value={s.mototaxisEstacion} total={s.totalMototaxis} color="bg-violet-500" />
              <ProgressRow label="Circulantes" value={s.mototaxisCirculantes} total={s.totalMototaxis} color="bg-emerald-500" />
            </div>
          </CardShell>

          {/* Familiares breakdown */}
          <CardShell
            title="Familiares"
            icon={<span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />}
          >
            <div className="flex items-center justify-around h-[calc(100%-2rem)]">
              <div className="text-center">
                <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-7 h-7 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-4xl font-extrabold text-sky-600 dark:text-sky-400">{s.totalFamiliares}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Motos familiares</p>
              </div>
              <div className="w-px h-16 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Del total de motos</p>
                <p className="text-3xl font-extrabold text-gray-700 dark:text-gray-200">
                  {s.totalMotocicletas > 0 ? Math.round((s.totalFamiliares / s.totalMotocicletas) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">son familiares</p>
              </div>
            </div>
          </CardShell>
        </div>
      )}

      {/* ── Bottom Row ── */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Documentación — todos los censos */}
          <CardShell
            title="Documentación"
            icon={<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />}
          >
            <div className="flex items-center justify-around h-[calc(100%-2rem)]">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{s.totalDocumentosAlDia}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Al día</p>
              </div>
              <div className="w-px h-16 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
                </div>
                <p className="text-3xl font-extrabold text-red-500 dark:text-red-400">{s.totalSinDocumentos}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sin documentos</p>
              </div>
            </div>
          </CardShell>

          {/* Motocarros breakdown */}
          <CardShell
            title="Motocarros"
            icon={<span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />}
          >
            <div className="space-y-4">
              <ProgressRow label="Propios" value={s.motocarrosPropios} total={s.totalMotocarros} color="bg-violet-500" />
              <ProgressRow label="Pagan Tarifa" value={s.motocarrosPaganTarifa} total={s.totalMotocarros} color="bg-orange-500" />
            </div>
          </CardShell>
        </div>
      )}

      {/* ── Recent Censuses ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Actividad Reciente</h2>
          </div>
          <button
            onClick={() => router.push('/censos')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/40">
                {['Código', 'Placa', 'Tipo', 'Estado', 'Fecha'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentCensuses.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No hay censos registrados</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Comienza registrando el primer censo</p>
                      <button
                        onClick={() => router.push('/censos/nuevo')}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar Censo
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                recentCensuses.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/censos/${c.id}`)}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-bold text-blue-600 dark:text-blue-400">{c.codigoCenso}</td>
                    <td className="px-5 py-3.5 text-sm font-extrabold text-gray-900 dark:text-white tracking-widest">{c.placa}</td>
                    <td className="px-5 py-3.5"><Badge config={TIPO_CONFIG[c.tipoVehiculo] ?? { label: c.tipoVehiculo, classes: 'bg-gray-100 text-gray-600' }} /></td>
                    <td className="px-5 py-3.5"><Badge config={STATUS_CONFIG[c.estado] ?? { label: c.estado, classes: 'bg-gray-100 text-gray-600' }} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {format(new Date(c.fechaCenso), 'dd MMM yyyy', { locale: es })}
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
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Sin censos todavía</p>
              <button
                onClick={() => router.push('/censos/nuevo')}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar
              </button>
            </div>
          ) : (
            recentCensuses.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/censos/${c.id}`)}
                className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{c.codigoCenso}</span>
                  <Badge config={STATUS_CONFIG[c.estado] ?? { label: c.estado, classes: 'bg-gray-100 text-gray-600' }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white tracking-widest">{c.placa}</p>
                    <Badge config={TIPO_CONFIG[c.tipoVehiculo] ?? { label: c.tipoVehiculo, classes: 'bg-gray-100 text-gray-600' }} />
                  </div>
                  <p className="text-xs text-gray-400">{format(new Date(c.fechaCenso), 'dd/MM/yy', { locale: es })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-10">
        <button
          onClick={() => router.push('/censos/nuevo')}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
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
