import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(filters?: StatisticsFiltersDto) {
    const where = this.buildWhereClause(filters);

    const [
      totalCensos,
      totalMotocicletas,
      totalMotocarros,
      totalMototaxis,
      totalFamiliares,
      mototaxisPropios,
      mototaxisPaganTarifa,
      mototaxisEstacion,
      mototaxisCirculantes,
      mototaxisDocumentosAlDia,
      mototaxisSinDocumentos,
      motocarrosPropios,
      motocarrosPaganTarifa,
      censosHoy,
      censosSemana,
    ] = await Promise.all([
      this.prisma.census.count({ where }),
      this.prisma.census.count({ where: { ...where, tipoVehiculo: 'MOTOCICLETA' } }),
      this.prisma.census.count({ where: { ...where, tipoVehiculo: 'MOTOCARRO' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'FAMILIAR' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI', propiedad: 'PROPIA' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI', propiedad: 'PAGA_TARIFA' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI', modalidad: 'ESTACION' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI', modalidad: 'CIRCULANTE' } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI', documentosAlDia: true } }),
      this.prisma.census.count({ where: { ...where, actividad: 'MOTOTAXI', documentosAlDia: false } }),
      this.prisma.census.count({ where: { ...where, tipoVehiculo: 'MOTOCARRO', propiedad: 'PROPIA' } }),
      this.prisma.census.count({ where: { ...where, tipoVehiculo: 'MOTOCARRO', propiedad: 'PAGA_TARIFA' } }),
      this.prisma.census.count({
        where: {
          ...where,
          fechaCenso: {
            gte: this.getStartOfDay(),
            lte: this.getEndOfDay(),
          },
        },
      }),
      this.prisma.census.count({
        where: {
          ...where,
          fechaCenso: {
            gte: this.getStartOfWeek(),
            lte: this.getEndOfDay(),
          },
        },
      }),
    ]);

    return {
      totalCensos,
      totalMotocicletas,
      totalMotocarros,
      totalMototaxis,
      totalFamiliares,
      mototaxisPropios,
      mototaxisPaganTarifa,
      mototaxisEstacion,
      mototaxisCirculantes,
      mototaxisDocumentosAlDia,
      mototaxisSinDocumentos,
      motocarrosPropios,
      motocarrosPaganTarifa,
      censosHoy,
      censosSemana,
    };
  }

  async getStatistics(filters?: StatisticsFiltersDto) {
    const where = this.buildWhereClause(filters);

    const [
      byTipoVehiculo,
      byActividad,
      byModalidad,
      byPropiedad,
      byHorario,
      byEstado,
      byEstacion,
      byCensista,
    ] = await Promise.all([
      this.prisma.census.groupBy({
        by: ['tipoVehiculo'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['actividad'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['modalidad'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['propiedad'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['horario'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['estado'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['estacionId'],
        where,
        _count: { id: true },
      }),
      this.prisma.census.groupBy({
        by: ['censistaId'],
        where,
        _count: { id: true },
      }),
    ]);

    // Resolve station names
    const stationIds = byEstacion
      .map((item) => item.estacionId)
      .filter((id): id is string => id !== null);
    const stations = stationIds.length
      ? await this.prisma.station.findMany({
          where: { id: { in: stationIds } },
          select: { id: true, nombre: true },
        })
      : [];
    const stationMap = new Map(stations.map((s) => [s.id, s.nombre]));

    // Resolve censista names
    const censistaIds = byCensista.map((item) => item.censistaId);
    const censistas = censistaIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: censistaIds } },
          select: { id: true, nombre: true },
        })
      : [];
    const censistaMap = new Map(censistas.map((c) => [c.id, c.nombre]));

    return {
      byTipoVehiculo: byTipoVehiculo.map((item) => ({
        tipo: item.tipoVehiculo,
        cantidad: item._count.id,
      })),
      byActividad: byActividad.map((item) => ({
        actividad: item.actividad,
        cantidad: item._count.id,
      })),
      byModalidad: byModalidad.map((item) => ({
        modalidad: item.modalidad,
        cantidad: item._count.id,
      })),
      byPropiedad: byPropiedad.map((item) => ({
        propiedad: item.propiedad,
        cantidad: item._count.id,
      })),
      byHorario: byHorario.map((item) => ({
        horario: item.horario,
        cantidad: item._count.id,
      })),
      byEstado: byEstado.map((item) => ({
        estado: item.estado,
        cantidad: item._count.id,
      })),
      byEstacion: byEstacion.map((item) => ({
        estacionId: item.estacionId,
        nombre: stationMap.get(item.estacionId || '') || 'Sin estación',
        cantidad: item._count.id,
      })),
      byCensista: byCensista.map((item) => ({
        censistaId: item.censistaId,
        nombre: censistaMap.get(item.censistaId) || 'Desconocido',
        cantidad: item._count.id,
      })),
    };
  }

  private buildWhereClause(filters?: StatisticsFiltersDto): any {
    const where: any = {};

    if (!filters) return where;

    if (filters.fechaInicial || filters.fechaFinal) {
      where.fechaCenso = {};
      if (filters.fechaInicial) {
        where.fechaCenso.gte = new Date(filters.fechaInicial);
      }
      if (filters.fechaFinal) {
        where.fechaCenso.lte = new Date(filters.fechaFinal + 'T23:59:59.999Z');
      }
    }

    if (filters.tipoVehiculo) {
      where.tipoVehiculo = filters.tipoVehiculo;
    }

    if (filters.actividad) {
      where.actividad = filters.actividad;
    }

    if (filters.estacion) {
      where.estacionId = filters.estacion;
    }

    if (filters.horario) {
      where.horario = filters.horario;
    }

    if (filters.documentosAlDia !== undefined) {
      where.documentosAlDia = filters.documentosAlDia;
    }

    if (filters.censistaId) {
      where.censistaId = filters.censistaId;
    }

    return where;
  }

  private getStartOfDay(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private getEndOfDay(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
}
