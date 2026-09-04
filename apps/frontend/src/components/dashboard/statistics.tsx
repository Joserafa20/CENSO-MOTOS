'use client';

import { FileText, Bike, Car, Users, TrendingUp, Clock, MapPin } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
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
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Motocicletas',
      value: stats.totalMotocicletas,
      icon: <Bike className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Motocarros',
      value: stats.totalMotocarros,
      icon: <Car className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Mototaxis',
      value: stats.totalMototaxis,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickStats = [
    {
      title: 'Censos Hoy',
      value: stats.censosHoy,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Censos Esta Semana',
      value: stats.censosSemana,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Familiares',
      value: stats.totalFamiliares,
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-lg p-4 border border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} rounded-lg p-3 text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mototaxis Breakdown */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2 text-orange-500" />
            Desglose Mototaxis
          </h3>
          <div className="space-y-3">
            <BreakdownRow
              label="Propios"
              value={stats.mototaxisPropios}
              total={stats.totalMototaxis}
            />
            <BreakdownRow
              label="Pagan Tarifa"
              value={stats.mototaxisPaganTarifa}
              total={stats.totalMototaxis}
            />
            <BreakdownRow
              label="En Estación"
              value={stats.mototaxisEstacion}
              total={stats.totalMototaxis}
            />
            <BreakdownRow
              label="Circulantes"
              value={stats.mototaxisCirculantes}
              total={stats.totalMototaxis}
            />
            <BreakdownRow
              label="Documentos al Día"
              value={stats.mototaxisDocumentosAlDia}
              total={stats.totalMototaxis}
            />
            <BreakdownRow
              label="Sin Documentos"
              value={stats.mototaxisSinDocumentos}
              total={stats.totalMototaxis}
            />
          </div>
        </div>

        {/* Motocarros Breakdown */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-4 h-4 mr-2 text-purple-500" />
            Desglose Motocarros
          </h3>
          <div className="space-y-3">
            <BreakdownRow
              label="Propios"
              value={stats.motocarrosPropios}
              total={stats.totalMotocarros}
            />
            <BreakdownRow
              label="Pagan Tarifa"
              value={stats.motocarrosPaganTarifa}
              total={stats.totalMotocarros}
            />
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
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="ml-3 text-xs text-gray-500 w-10 text-right">{percentage}%</span>
    </div>
  );
}
