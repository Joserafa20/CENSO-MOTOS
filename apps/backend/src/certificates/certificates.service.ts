import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CertificatePdfService } from './pdf/certificate-pdf.service';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);
  private readonly hmacSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly pdfService: CertificatePdfService,
    private readonly configService: ConfigService,
  ) {
    this.hmacSecret =
      this.configService.get<string>('CERTIFICATE_HMAC_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'default-hmac-secret-change-in-production';
  }

  async generateCertificate(censusId: string, userId?: string) {
    // 1. Find the census
    const census = await this.prisma.census.findUnique({
      where: { id: censusId },
      include: { certificate: true },
    });

    if (!census) {
      throw new NotFoundException('Censo no encontrado');
    }

    if (census.estado !== 'FINALIZADO') {
      throw new BadRequestException(
        'Solo se pueden generar certificados para censos finalizados',
      );
    }

    if (census.certificate) {
      throw new ConflictException(
        'Este censo ya tiene un certificado generado',
      );
    }

    // 2. Generate QR token: UUID + HMAC-SHA256 signature
    const uuid = crypto.randomUUID();
    const signature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(uuid)
      .digest('hex');
    const qrToken = `${uuid}.${signature}`;

    // 3. Generate codigoCertificado (same format as census code)
    const codigoCertificado = await this.generateCodigoCertificado();

    // 4. Create certificate and update census status
    const [certificate] = await this.prisma.$transaction([
      this.prisma.certificate.create({
        data: {
          censusId,
          codigoCertificado,
          qrToken,
          estado: 'VALIDO',
        },
      }),
      this.prisma.census.update({
        where: { id: censusId },
        data: { estado: 'CERTIFICADO_GENERADO' },
      }),
    ]);

    // 5. Audit log
    if (userId) {
      await this.auditService.logAction({
        userId,
        action: 'GENERATE_CERTIFICATE',
        entity: 'Certificate',
        entityId: certificate.id,
        description: `Certificado generado: ${codigoCertificado} para censo ${census.codigoCenso}`,
      });
    }

    return {
      id: certificate.id,
      codigoCertificado: certificate.codigoCertificado,
      qrToken: certificate.qrToken,
      fechaGeneracion: certificate.fechaGeneracion,
      estado: certificate.estado,
      censusId: certificate.censusId,
    };
  }

  async getCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        census: {
          select: {
            id: true,
            codigoCenso: true,
            placa: true,
            tipoVehiculo: true,
            actividad: true,
            fechaCenso: true,
            estado: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado');
    }

    return certificate;
  }

  async getCertificateByCensusId(censusId: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { censusId },
      include: {
        census: {
          select: {
            id: true,
            codigoCenso: true,
            placa: true,
            tipoVehiculo: true,
            actividad: true,
            fechaCenso: true,
            estado: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado para este censo');
    }

    return certificate;
  }

  async downloadCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        census: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado');
    }

    if (certificate.estado !== 'VALIDO') {
      throw new BadRequestException(
        'El certificado no está válido para descarga',
      );
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generatePdf({
      codigoCertificado: certificate.codigoCertificado,
      placa: certificate.census.placa,
      tipoVehiculo: certificate.census.tipoVehiculo,
      actividad: certificate.census.actividad || undefined,
      fechaCenso: certificate.census.fechaCenso,
      qrToken: certificate.qrToken,
    });

    return {
      buffer: pdfBuffer,
      filename: `certificado-${certificate.codigoCertificado}.pdf`,
      contentType: 'application/pdf',
    };
  }

  async findByQrToken(token: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { qrToken: token },
      include: {
        census: {
          select: {
            id: true,
            codigoCenso: true,
            placa: true,
            tipoVehiculo: true,
            actividad: true,
            fechaCenso: true,
            estado: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado');
    }

    return certificate;
  }

  private async generateCodigoCertificado(): Promise<string> {
    const year = new Date().getFullYear();

    return await this.prisma.$transaction(async (tx) => {
      const lastCertificate = await tx.certificate.findFirst({
        where: {
          codigoCertificado: {
            startsWith: `CEN-${year}-`,
          },
        },
        orderBy: {
          codigoCertificado: 'desc',
        },
      });

      let sequence = 1;
      if (lastCertificate) {
        const lastSequence = parseInt(
          lastCertificate.codigoCertificado.split('-')[2],
          10,
        );
        sequence = lastSequence + 1;
      }

      const paddedSequence = sequence.toString().padStart(6, '0');
      return `CEN-${year}-${paddedSequence}`;
    });
  }
}
