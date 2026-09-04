import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCensistaDto } from './dto/create-censista.dto';
import { UpdateCensistaDto } from './dto/update-censista.dto';

@Injectable()
export class CensistasService {
  private readonly logger = new Logger(CensistasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCensistaDto: CreateCensistaDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createCensistaDto.username },
          { documento: createCensistaDto.documento },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.username === createCensistaDto.username
          ? 'El nombre de usuario ya existe'
          : 'El documento ya está registrado',
      );
    }

    const passwordHash = await bcrypt.hash(createCensistaDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nombre: createCensistaDto.nombre,
        documento: createCensistaDto.documento,
        username: createCensistaDto.username,
        passwordHash,
        rol: 'CENSISTA',
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
        documento: true,
        username: true,
        rol: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Censista creado: ${user.nombre} (${user.id})`);
    return user;
  }

  async findAll() {
    const censistas = await this.prisma.user.findMany({
      where: { rol: 'CENSISTA' },
      select: {
        id: true,
        nombre: true,
        documento: true,
        username: true,
        rol: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { censos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get last census date for each censista
    const censistasWithLastCensus = await Promise.all(
      censistas.map(async (censista) => {
        const lastCensus = await this.prisma.census.findFirst({
          where: { censistaId: censista.id },
          orderBy: { fechaCenso: 'desc' },
          select: { fechaCenso: true },
        });

        return {
          ...censista,
          totalCensos: censista._count.censos,
          ultimoCenso: lastCensus?.fechaCenso || null,
        };
      }),
    );

    return censistasWithLastCensus;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        documento: true,
        username: true,
        rol: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { censos: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Censista no encontrado');
    }

    const lastCensus = await this.prisma.census.findFirst({
      where: { censistaId: id },
      orderBy: { fechaCenso: 'desc' },
      select: { fechaCenso: true },
    });

    return {
      ...user,
      totalCensos: user._count.censos,
      ultimoCenso: lastCensus?.fechaCenso || null,
    };
  }

  async update(id: string, updateCensistaDto: UpdateCensistaDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Censista no encontrado');
    }

    if (updateCensistaDto.username || updateCensistaDto.documento) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateCensistaDto.username
                  ? [{ username: updateCensistaDto.username }]
                  : []),
                ...(updateCensistaDto.documento
                  ? [{ documento: updateCensistaDto.documento }]
                  : []),
              ],
            },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException('El nombre de usuario o documento ya está en uso');
      }
    }

    const data: any = { ...updateCensistaDto };

    if (updateCensistaDto.password) {
      data.passwordHash = await bcrypt.hash(updateCensistaDto.password, 10);
      delete data.password;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nombre: true,
        documento: true,
        username: true,
        rol: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Censista actualizado: ${user.nombre} (${user.id})`);
    return user;
  }

  async toggleStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Censista no encontrado');
    }

    if (user.rol !== 'CENSISTA') {
      throw new ConflictException('Solo se puede cambiar estado de censistas');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { estado: !user.estado },
      select: {
        id: true,
        nombre: true,
        documento: true,
        username: true,
        rol: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Censista ${updated.nombre} cambió a estado: ${updated.estado ? 'activo' : 'inactivo'}`);
    return updated;
  }
}
