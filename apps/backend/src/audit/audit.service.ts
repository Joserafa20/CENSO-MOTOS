import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    description?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          usuarioId: params.userId || null,
          accion: params.action,
          entidad: params.entity,
          entidadId: params.entityId || null,
          descripcion: params.description || null,
          ip: params.ip || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log: ${error.message}`,
        error.stack,
      );
    }
  }
}
