import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class CertificatePdfService {
  private readonly logger = new Logger(CertificatePdfService.name);

  constructor(private readonly configService: ConfigService) {}

  async generatePdf(params: {
    codigoCertificado: string;
    placa: string;
    tipoVehiculo: string;
    actividad?: string;
    fechaCenso: Date;
    qrToken: string;
    notas?: string;
  }): Promise<Buffer> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const validationUrl = `${frontendUrl}/validar/${params.qrToken}`;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 60,
          right: 60,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header - Logo placeholder
      this.drawLogoPlaceholder(doc);

      // Title
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('ALCALDÍA MUNICIPAL DE SABANALARGA', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('CERTIFICACIÓN DE CENSO DE MOTOCICLETA/MOTOCARRO', {
          align: 'center',
        });

      doc.moveDown(1);

      // Separator line
      doc
        .moveTo(60, doc.y)
        .lineTo(doc.page.width - 60, doc.y)
        .strokeColor('#000000')
        .lineWidth(1)
        .stroke();

      doc.moveDown(1);

      // Certificate code
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Código de Certificado:', { continued: true })
        .font('Helvetica')
        .text(` ${params.codigoCertificado}`);

      doc.moveDown(0.5);

      // Placa
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Número de Placa:', { continued: true })
        .font('Helvetica')
        .text(` ${params.placa}`);

      doc.moveDown(0.5);

      // Tipo de vehículo
      const tipoLabel =
        params.tipoVehiculo === 'MOTOCICLETA'
          ? 'Motocicleta'
          : 'Motocarro';
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Tipo de Vehículo:', { continued: true })
        .font('Helvetica')
        .text(` ${tipoLabel}`);

      doc.moveDown(0.5);

      // Actividad
      if (params.actividad) {
        const actividadLabel =
          params.actividad === 'MOTOTAXI' ? 'Mototaxi' : 'Familiar';
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Actividad:', { continued: true })
          .font('Helvetica')
          .text(` ${actividadLabel}`);
        doc.moveDown(0.5);
      }

      // Fecha del censo
      const fechaFormat = params.fechaCenso.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Fecha del Censo:', { continued: true })
        .font('Helvetica')
        .text(` ${fechaFormat}`);

      doc.moveDown(1);

      // QR Code
      try {
        const qrDataUrl = await QRCode.toDataURL(validationUrl, {
          width: 150,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        // Convert data URL to buffer
        const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');

        // Center the QR code
        const qrX = (doc.page.width - 150) / 2;
        doc.image(qrBuffer, qrX, doc.y, { width: 150, height: 150 });

        doc.moveDown(1);
      } catch (error) {
        this.logger.error('Error generating QR code', error);
        doc
          .fontSize(10)
          .text('[Error al generar código QR]', { align: 'center' });
        doc.moveDown(1);
      }

      // Validation code
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Código de validación:', { align: 'center', continued: true })
        .font('Helvetica')
        .text(` ${params.qrToken}`, { align: 'center' });

      doc.moveDown(0.5);

      // Validation URL
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(validationUrl, { align: 'center', link: validationUrl });

      doc.moveDown(1);

      // Separator line
      doc
        .moveTo(60, doc.y)
        .lineTo(doc.page.width - 60, doc.y)
        .strokeColor('#000000')
        .lineWidth(1)
        .stroke();

      doc.moveDown(0.5);

      // Notes if provided
      if (params.notas) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Notas:', { align: 'left' })
          .font('Helvetica')
          .text(params.notas, { align: 'left' });
        doc.moveDown(0.5);
      }

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Este certificado es válido únicamente con el código de validación generado.',
          { align: 'center' },
        );

      doc.moveDown(0.3);

      doc
        .fontSize(8)
        .text(
          `Fecha de generación: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`,
          { align: 'center' },
        );

      doc.end();
    });
  }

  private drawLogoPlaceholder(doc: PDFKit.PDFDocument): void {
    const centerX = doc.page.width / 2;

    // Draw rectangle
    doc
      .rect(centerX - 40, 50, 80, 80)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();

    // Add text inside
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('ESCUDO', centerX - 40, 80, {
        width: 80,
        align: 'center',
      });

    doc.moveDown(3);
  }
}
