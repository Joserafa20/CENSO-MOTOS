import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as https from 'https';
import * as http from 'http';

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
    alcaldiaData?: { nombre: string; logoUrl?: string };
  }): Promise<Buffer> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const validationUrl = `${frontendUrl}/validar/${params.qrToken}`;

    // Pre-fetch async assets before opening the PDF stream
    const [qrBuffer, logoBuffer] = await Promise.all([
      this.generateQrBuffer(validationUrl),
      this.fetchLogoBuffer(params.alcaldiaData?.logoUrl),
    ]);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header logo
      this.drawLogo(doc, logoBuffer);

      // Title
      const alcaldiaNombre = (params.alcaldiaData?.nombre || 'Alcaldía Municipal de Sabanalarga').toUpperCase();
      doc.fontSize(16).font('Helvetica-Bold').text(alcaldiaNombre, { align: 'center' });
      doc.moveDown(0.5);

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('CERTIFICACIÓN DE CENSO DE MOTOCICLETA/MOTOCARRO', { align: 'center' });
      doc.moveDown(1);

      // Separator
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#000000').lineWidth(1).stroke();
      doc.moveDown(1);

      // Certificate code
      doc.fontSize(12).font('Helvetica-Bold').text('Código de Certificado:', { continued: true })
        .font('Helvetica').text(` ${params.codigoCertificado}`);
      doc.moveDown(0.5);

      // Placa
      doc.fontSize(12).font('Helvetica-Bold').text('Número de Placa:', { continued: true })
        .font('Helvetica').text(` ${params.placa}`);
      doc.moveDown(0.5);

      // Tipo de vehículo
      const tipoLabel = params.tipoVehiculo === 'MOTOCICLETA' ? 'Motocicleta' : 'Motocarro';
      doc.fontSize(12).font('Helvetica-Bold').text('Tipo de Vehículo:', { continued: true })
        .font('Helvetica').text(` ${tipoLabel}`);
      doc.moveDown(0.5);

      // Actividad
      if (params.actividad) {
        const actividadLabel = params.actividad === 'MOTOTAXI' ? 'Mototaxi' : 'Familiar';
        doc.fontSize(12).font('Helvetica-Bold').text('Actividad:', { continued: true })
          .font('Helvetica').text(` ${actividadLabel}`);
        doc.moveDown(0.5);
      }

      // Fecha del censo
      const fechaFormat = params.fechaCenso.toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      doc.fontSize(12).font('Helvetica-Bold').text('Fecha del Censo:', { continued: true })
        .font('Helvetica').text(` ${fechaFormat}`);
      doc.moveDown(1);

      // QR code
      if (qrBuffer) {
        const qrX = (doc.page.width - 150) / 2;
        doc.image(qrBuffer, qrX, doc.y, { width: 150, height: 150 });
        doc.moveDown(1);
      } else {
        doc.fontSize(10).text('[Error al generar código QR]', { align: 'center' });
        doc.moveDown(1);
      }

      // Validation code
      doc.fontSize(10).font('Helvetica-Bold').text('Código de validación:', { align: 'center', continued: true })
        .font('Helvetica').text(` ${params.qrToken}`, { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica').text(validationUrl, { align: 'center', link: validationUrl });
      doc.moveDown(1);

      // Separator
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#000000').lineWidth(1).stroke();
      doc.moveDown(0.5);

      // Notes
      if (params.notas) {
        doc.fontSize(10).font('Helvetica-Bold').text('Notas:', { align: 'left' })
          .font('Helvetica').text(params.notas, { align: 'left' });
        doc.moveDown(0.5);
      }

      // Footer
      doc.fontSize(8).font('Helvetica')
        .text('Este certificado es válido únicamente con el código de validación generado.', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(8)
        .text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, { align: 'center' });

      doc.end();
    });
  }

  private drawLogo(doc: any, logoBuffer: Buffer | null): void {
    const centerX = doc.page.width / 2;
    const logoSize = 80;
    const logoX = centerX - logoSize / 2;
    const logoY = 50;

    if (logoBuffer) {
      doc.image(logoBuffer, logoX, logoY, { width: logoSize, height: logoSize, fit: [logoSize, logoSize] });
    } else {
      doc.rect(logoX, logoY, logoSize, logoSize).lineWidth(1).strokeColor('#000000').stroke();
      doc.fontSize(10).font('Helvetica-Bold').text('ESCUDO', logoX, logoY + 30, { width: logoSize, align: 'center' });
    }

    doc.moveDown(3);
  }

  private async generateQrBuffer(url: string): Promise<Buffer | null> {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 150, margin: 2, color: { dark: '#000000', light: '#FFFFFF' },
      });
      const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    } catch (err) {
      this.logger.error('Error generating QR code', err);
      return null;
    }
  }

  private async fetchLogoBuffer(url?: string): Promise<Buffer | null> {
    if (!url) return null;
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode !== 200) {
          this.logger.warn(`Logo fetch returned HTTP ${res.statusCode} for ${url}`);
          res.resume();
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', (err) => {
          this.logger.warn(`Logo fetch error: ${err}`);
          resolve(null);
        });
      }).on('error', (err) => {
        this.logger.warn(`Logo fetch connection error: ${err}`);
        resolve(null);
      });
    });
  }
}
