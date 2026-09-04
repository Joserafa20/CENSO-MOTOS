import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createStationDto: CreateStationDto) {
    const station = await this.prisma.station.create({
      data: {
        nombre: createStationDto.nombre,
        ubicacion: createStationDto.ubicacion,
        observaciones: createStationDto.observaciones || null,
      },
    });

    this.logger.log(`Estación creada: ${station.nombre} (${station.id})`);
    return station;
  }

  async findAll() {
    return this.prisma.station.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const station = await this.prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException('Estación no encontrada');
    }

    return station;
  }

  async update(id: string, updateStationDto: UpdateStationDto) {
    await this.findOne(id);

    const station = await this.prisma.station.update({
      where: { id },
      data: {
        nombre: updateStationDto.nombre,
        ubicacion: updateStationDto.ubicacion,
        observaciones: updateStationDto.observaciones,
      },
    });

    this.logger.log(`Estación actualizada: ${station.nombre} (${station.id})`);
    return station;
  }

  async toggleStatus(id: string) {
    const station = await this.findOne(id);

    const newStatus = station.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';

    const updated = await this.prisma.station.update({
      where: { id },
      data: { estado: newStatus as any },
    });

    this.logger.log(`Estación ${updated.nombre} cambió a estado: ${newStatus}`);
    return updated;
  }
}
