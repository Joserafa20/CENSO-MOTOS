import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByPlaca(placa: string) {
    const normalizedPlaca = placa.toUpperCase().trim();

    const census = await this.prisma.census.findFirst({
      where: {
        placa: normalizedPlaca,
        estado: { in: ['FINALIZADO', 'CERTIFICADO_GENERADO'] },
      },
      include: {
        certificate: {
          select: {
            id: true,
            codigoCertificado: true,
            fechaGeneracion: true,
            estado: true,
          },
        },
      },
    });

    if (!census) {
      throw new NotFoundException(
        'No se encontró un censo asociado a esta placa',
      );
    }

    // Return limited public info
    return {
      placa: census.placa,
      tipoVehiculo: census.tipoVehiculo,
      actividad: census.actividad,
      estado: census.estado,
      fechaCenso: census.fechaCenso,
      codigoCenso: census.codigoCenso,
      certificate: census.certificate,
    };
  }

  async validateToken(token: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { qrToken: token },
      include: {
        census: {
          select: {
            placa: true,
            tipoVehiculo: true,
            actividad: true,
            fechaCenso: true,
            codigoCenso: true,
            estado: true,
          },
        },
      },
    });

    if (!certificate) {
      return {
        valid: false,
        message: 'Certificado no encontrado',
      };
    }

    if (certificate.estado !== 'VALIDO') {
      return {
        valid: false,
        message: 'Certificado anulado',
        certificate: {
          codigoCertificado: certificate.codigoCertificado,
          estado: certificate.estado,
        },
      };
    }

    return {
      valid: true,
      message: 'Certificado válido',
      certificate: {
        codigoCertificado: certificate.codigoCertificado,
        fechaGeneracion: certificate.fechaGeneracion,
        estado: certificate.estado,
      },
      census: {
        placa: certificate.census.placa,
        tipoVehiculo: certificate.census.tipoVehiculo,
        actividad: certificate.census.actividad,
        fechaCenso: certificate.census.fechaCenso,
        codigoCenso: certificate.census.codigoCenso,
      },
    };
  }
}
