import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CertificatesService } from '../certificates/certificates.service';
import { BusinessRulesService } from '../rules/business-rules.service';
import { CreateCensusDto } from './dto/create-census.dto';
import { UpdateCensusDto } from './dto/update-census.dto';

@Injectable()
export class CensusesService {
  private readonly logger = new Logger(CensusesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly businessRules: BusinessRulesService,
    private readonly certificatesService: CertificatesService,
  ) {}

  async create(
    createCensusDto: CreateCensusDto,
    userId: string,
    ip?: string,
    userAgent?: string,
  ) {
    // 1. Duplicate plate control
    const existingCensus = await this.prisma.census.findFirst({
      where: {
        placa: createCensusDto.placa.toUpperCase(),
        estado: { in: ['FINALIZADO', 'CERTIFICADO_GENERADO'] },
      },
    });

    if (existingCensus) {
      throw new ConflictException(
        'Esta placa ya cuenta con un censo registrado',
      );
    }

    // 2. Validate business rules
    const validation = this.businessRules.validateCensus({
      tipoVehiculo: createCensusDto.tipoVehiculo,
      actividad: createCensusDto.actividad,
      propiedad: createCensusDto.propiedad,
      modalidad: createCensusDto.modalidad,
      valorTarifa: createCensusDto.valorTarifa,
      estacionId: createCensusDto.estacionId,
      documentosAlDia: createCensusDto.documentosAlDia,
      horario: createCensusDto.horario,
    });

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Error de validación del censo',
        errors: validation.errors,
      });
    }

    // 3. Check for active draft census for same placa (replace it)
    const existingDraft = await this.prisma.census.findFirst({
      where: {
        placa: createCensusDto.placa.toUpperCase(),
        censistaId: userId,
        estado: 'BORRADOR',
      },
    });

    if (existingDraft) {
      // Delete the existing draft
      await this.prisma.census.delete({
        where: { id: existingDraft.id },
      });
    }

    // 4. Generate codigoCenso in transaction
    const codigoCenso = await this.generateCodigoCenso();

    // 5. Create census
    const census = await this.prisma.census.create({
      data: {
        codigoCenso,
        placa: createCensusDto.placa.toUpperCase(),
        tipoVehiculo: createCensusDto.tipoVehiculo as any,
        actividad: createCensusDto.actividad as any || null,
        propiedad: createCensusDto.propiedad as any || null,
        modalidad: createCensusDto.modalidad as any || null,
        valorTarifa: createCensusDto.valorTarifa || null,
        estacionId: createCensusDto.estacionId || null,
        documentosAlDia: createCensusDto.documentosAlDia ?? null,
        horario: createCensusDto.horario as any || null,
        censistaId: userId,
        latitud: createCensusDto.latitud || null,
        longitud: createCensusDto.longitud || null,
      },
      include: {
        estacion: true,
        censista: {
          select: { id: true, nombre: true, username: true },
        },
      },
    });

    // 6. Audit log
    await this.auditService.logAction({
      userId,
      action: 'CREATE_CENSUS',
      entity: 'Census',
      entityId: census.id,
      description: `Censo creado: ${census.codigoCenso} para placa ${census.placa}`,
      ip,
      userAgent,
    });

    return census;
  }

  async findOne(id: string, userId: string) {
    const census = await this.prisma.census.findUnique({
      where: { id },
      include: {
        estacion: true,
        censista: {
          select: { id: true, nombre: true, username: true },
        },
        certificate: true,
      },
    });

    if (!census) {
      throw new NotFoundException('Censo no encontrado');
    }

    if (census.censistaId !== userId) {
      throw new ForbiddenException('No tiene acceso a este censo');
    }

    return census;
  }

  async findAllByUser(
    userId: string,
    filters?: {
      estado?: string;
      search?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { censistaId: userId };

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.search) {
      where.OR = [
        { placa: { contains: filters.search, mode: 'insensitive' } },
        { codigoCenso: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fechaCenso = {};
      if (filters.fechaDesde) {
        where.fechaCenso.gte = new Date(filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        where.fechaCenso.lte = new Date(filters.fechaHasta);
      }
    }

    const [censuses, total] = await Promise.all([
      this.prisma.census.findMany({
        where,
        include: {
          estacion: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.census.count({ where }),
    ]);

    return {
      data: censuses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: string,
    updateCensusDto: UpdateCensusDto,
    userId: string,
    ip?: string,
    userAgent?: string,
  ) {
    const census = await this.prisma.census.findUnique({
      where: { id },
    });

    if (!census) {
      throw new NotFoundException('Censo no encontrado');
    }

    if (census.censistaId !== userId) {
      throw new ForbiddenException('No tiene acceso a este censo');
    }

    if (census.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'No se puede modificar un censo que no está en estado borrador',
      );
    }

    // Merge data for validation
    const mergedData = {
      tipoVehiculo: updateCensusDto.tipoVehiculo || census.tipoVehiculo,
      actividad: updateCensusDto.actividad || census.actividad,
      propiedad: updateCensusDto.propiedad || census.propiedad,
      modalidad: updateCensusDto.modalidad || census.modalidad,
      valorTarifa: updateCensusDto.valorTarifa ?? census.valorTarifa?.toNumber(),
      estacionId: updateCensusDto.estacionId || census.estacionId,
      documentosAlDia: updateCensusDto.documentosAlDia ?? census.documentosAlDia,
      horario: updateCensusDto.horario || census.horario,
    };

    // Validate business rules
    const validation = this.businessRules.validateCensus({
      tipoVehiculo: mergedData.tipoVehiculo,
      actividad: mergedData.actividad as string,
      propiedad: mergedData.propiedad as string,
      modalidad: mergedData.modalidad as string,
      valorTarifa: mergedData.valorTarifa,
      estacionId: mergedData.estacionId,
      documentosAlDia: mergedData.documentosAlDia as boolean,
      horario: mergedData.horario as string,
    });

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Error de validación del censo',
        errors: validation.errors,
      });
    }

    const updated = await this.prisma.census.update({
      where: { id },
      data: {
        placa: updateCensusDto.placa?.toUpperCase() || census.placa,
        tipoVehiculo: (updateCensusDto.tipoVehiculo as any) || census.tipoVehiculo,
        actividad: (updateCensusDto.actividad as any) || census.actividad,
        propiedad: (updateCensusDto.propiedad as any) || census.propiedad,
        modalidad: (updateCensusDto.modalidad as any) || census.modalidad,
        valorTarifa: updateCensusDto.valorTarifa ?? census.valorTarifa,
        estacionId: updateCensusDto.estacionId ?? census.estacionId,
        documentosAlDia: updateCensusDto.documentosAlDia ?? census.documentosAlDia,
        horario: (updateCensusDto.horario as any) || census.horario,
        latitud: updateCensusDto.latitud ?? census.latitud,
        longitud: updateCensusDto.longitud ?? census.longitud,
      },
      include: {
        estacion: true,
        censista: {
          select: { id: true, nombre: true, username: true },
        },
      },
    });

    await this.auditService.logAction({
      userId,
      action: 'UPDATE_CENSUS',
      entity: 'Census',
      entityId: id,
      description: `Censo actualizado: ${updated.codigoCenso}`,
      ip,
      userAgent,
    });

    return updated;
  }

  async finalize(
    id: string,
    userId: string,
    ip?: string,
    userAgent?: string,
  ) {
    const census = await this.prisma.census.findUnique({
      where: { id },
      include: { estacion: true },
    });

    if (!census) {
      throw new NotFoundException('Censo no encontrado');
    }

    if (census.censistaId !== userId) {
      throw new ForbiddenException('No tiene acceso a este censo');
    }

    if (census.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden finalizar censos en estado borrador',
      );
    }

    // Validate business rules for finalization
    const validation = this.businessRules.validateCensus({
      tipoVehiculo: census.tipoVehiculo,
      actividad: census.actividad as string,
      propiedad: census.propiedad as string,
      modalidad: census.modalidad as string,
      valorTarifa: census.valorTarifa?.toNumber(),
      estacionId: census.estacionId,
      documentosAlDia: census.documentosAlDia as boolean,
      horario: census.horario as string,
    });

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'El censo no cumple con las reglas de negocio para finalizar',
        errors: validation.errors,
      });
    }

    // Finalize census
    const finalized = await this.prisma.census.update({
      where: { id },
      data: {
        estado: 'FINALIZADO',
      },
      include: {
        estacion: true,
        censista: {
          select: { id: true, nombre: true, username: true },
        },
        certificate: true,
      },
    });

    await this.auditService.logAction({
      userId,
      action: 'FINALIZE_CENSUS',
      entity: 'Census',
      entityId: id,
      description: `Censo finalizado: ${finalized.codigoCenso}`,
      ip,
      userAgent,
    });

    // Auto-generate certificate after finalization
    let certificate = null;
    try {
      certificate = await this.certificatesService.generateCertificate(
        id,
        userId,
      );
      this.logger.log(
        `Certificado auto-generado para censo ${finalized.codigoCenso}: ${certificate.codigoCertificado}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al auto-generar certificado para censo ${id}: ${error.message}`,
        error.stack,
      );
      // Don't fail the finalization if certificate generation fails
    }

    return {
      ...finalized,
      certificate,
    };
  }

  private async generateCodigoCenso(): Promise<string> {
    const year = new Date().getFullYear();

    // Use transaction to ensure uniqueness
    return await this.prisma.$transaction(async (tx) => {
      // Find the last census for this year
      const lastCensus = await tx.census.findFirst({
        where: {
          codigoCenso: {
            startsWith: `CEN-${year}-`,
          },
        },
        orderBy: {
          codigoCenso: 'desc',
        },
      });

      let sequence = 1;
      if (lastCensus) {
        const lastSequence = parseInt(lastCensus.codigoCenso.split('-')[2], 10);
        sequence = lastSequence + 1;
      }

      const paddedSequence = sequence.toString().padStart(6, '0');
      return `CEN-${year}-${paddedSequence}`;
    });
  }
}
