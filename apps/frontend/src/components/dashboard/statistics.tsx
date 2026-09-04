'use client';

import { FileText, Bike, Car, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

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

interface StatisticsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

export default function Statistics({ stats, isLoading }: StatisticsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const mainStats = [
    {
      title: 'Total Censos',
      value: stats.totalCensos,
      sub: `${stats.censosHoy} hoy · ${stats.censosSemana} esta semana`,
      icon: <FileText className="w-5 h-5" />,
      accent: 'border-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Motocicletas',
      value: stats.totalMotocicletas,
      sub: `${stats.totalMototaxis} mototaxis · ${stats.totalFamiliares} familiares`,
      icon: <Bike className="w-5 h-5" />,
      accent: 'border-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Motocarros',
      value: stats.totalMotocarros,
      sub: `${stats.motocarrosPropios} propios · ${stats.motocarrosPaganTarifa} pagan tarifa`,
      icon: <Car className="w-5 h-5" />,
      accent: 'border-violet-500',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      title: 'Mototaxis',
      value: stats.totalMototaxis,
      sub: `${stats.mototaxisEstacion} estación · ${stats.mototaxisCirculantes} circulantes`,
      icon: <Users className="w-5 h-5" />,
      accent: 'border-orange-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((card, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border-l-4 ${card.accent} shadow-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <div className={`${card.iconBg} p-2 rounded-xl`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mototaxis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center mb-5">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-xl mr-3">
              <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Desglose Mototaxis</h3>
          </div>
          <div className="space-y-3.5">
            <BreakdownRow label="Propios" value={stats.mototaxisPropios} total={stats.totalMototaxis} color="bg-blue-500" />
            <BreakdownRow label="Pagan Tarifa" value={stats.mototaxisPaganTarifa} total={stats.totalMototaxis} color="bg-orange-500" />
            <BreakdownRow label="En Estación" value={stats.mototaxisEstacion} total={stats.totalMototaxis} color="bg-violet-500" />
            <BreakdownRow label="Circulantes" value={stats.mototaxisCirculantes} total={stats.totalMototaxis} color="bg-emerald-500" />
          </div>
        </div>

        {/* Documentos + Motocarros */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-xl mr-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Documentación</h3>
            </div>
            <div className="flex items-center gap-4">
              <DocStat
                label="Al día"
                value={stats.mototaxisDocumentosAlDia}
                total={stats.totalMototaxis}
                positive
              />
              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
              <DocStat
                label="Sin documentos"
                value={stats.mototaxisSinDocumentos}
                total={stats.totalMototaxis}
                positive={false}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-violet-100 dark:bg-violet-900/40 p-2 rounded-xl mr-3">
                <Car className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Desglose Motocarros</h3>
            </div>
            <div className="space-y-3">
              <BreakdownRow label="Propios" value={stats.motocarrosPropios} total={stats.totalMotocarros} color="bg-violet-500" />
              <BreakdownRow label="Pagan Tarifa" value={stats.motocarrosPaganTarifa} total={stats.totalMotocarros} color="bg-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">{percentage}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DocStat({
  label,
  value,
  total,
  positive,
}: {
  label: string;
  value: number;
  total: number;
  positive: boolean;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        {positive ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{percentage}%</p>
    </div>
  );
}
