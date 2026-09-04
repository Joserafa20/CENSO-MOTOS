import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as https from 'https';
import * as http from 'http';

// Brand colors
const BLUE_DARK = '#1a3c6b';
const BLUE_MID  = '#2563eb';
const BLUE_LIGHT = '#dbeafe';
const GRAY_TEXT = '#374151';
const GRAY_LIGHT = '#f3f4f6';
const GRAY_BORDER = '#d1d5db';
const WHITE = '#ffffff';
const GOLD = '#b45309';

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
    alcaldiaData?: {
      nombre: string;
      nit?: string;
      municipio?: string;
      departamento?: string;
      alcalde?: string;
      cargo?: string;
      logoUrl?: string;
    };
  }): Promise<Buffer> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'https://censo-motos-frontend-chi.vercel.app';
    const validationUrl = `${frontendUrl}/validar/${params.qrToken}`;

    const [qrBuffer, logoBuffer] = await Promise.all([
      this.generateQrBuffer(validationUrl),
      this.fetchLogoBuffer(params.alcaldiaData?.logoUrl),
    ]);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
          Title: `Certificado de Censo - ${params.placa}`,
          Author: params.alcaldiaData?.nombre || 'Alcaldía Municipal',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const W = doc.page.width;   // 612
      const H = doc.page.height;  // 792
      const M = 48; // margin

      // ── HEADER BAND ──────────────────────────────────────────────
      doc.rect(0, 0, W, 130).fill(BLUE_DARK);
      doc.rect(0, 128, W, 4).fill(GOLD);

      // Logo in header (left side)
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, M, 15, { width: 90, height: 90, fit: [90, 90] });
        } catch {
          this._drawPlaceholderLogo(doc, M, 20);
        }
      } else {
        this._drawPlaceholderLogo(doc, M, 20);
      }

      // Institution name + location (center/right)
      const alcaldiaNombre = (params.alcaldiaData?.nombre || 'ALCALDÍA MUNICIPAL').toUpperCase();
      doc.font('Helvetica-Bold').fontSize(15).fillColor(WHITE)
        .text(alcaldiaNombre, M + 100, 22, { width: W - M - 100 - M, align: 'center' });

      const municipioLine = [
        params.alcaldiaData?.municipio,
        params.alcaldiaData?.departamento,
      ].filter(Boolean).join(' — ');
      if (municipioLine) {
        doc.font('Helvetica').fontSize(10).fillColor('#93c5fd')
          .text(municipioLine, M + 100, 44, { width: W - M - 100 - M, align: 'center' });
      }
      if (params.alcaldiaData?.nit) {
        doc.font('Helvetica').fontSize(9).fillColor('#bfdbfe')
          .text(`NIT: ${params.alcaldiaData.nit}`, M + 100, 60, { width: W - M - 100 - M, align: 'center' });
      }

      // Certificate type label
      doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD)
        .text('CERTIFICADO DE CENSO MUNICIPAL DE MOTOS', M + 100, 82, {
          width: W - M - 100 - M, align: 'center',
        });
      doc.font('Helvetica').fontSize(9).fillColor('#bfdbfe')
        .text('Sistema Oficial de Registro de Vehículos', M + 100, 100, {
          width: W - M - 100 - M, align: 'center',
        });

      // ── CERT CODE BANNER ─────────────────────────────────────────
      doc.rect(0, 132, W, 32).fill(BLUE_LIGHT);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BLUE_DARK)
        .text('Código de Certificado:', M, 141, { continued: true })
        .font('Helvetica-Bold').fontSize(12).fillColor(BLUE_MID)
        .text(`  ${params.codigoCertificado}`, { continued: false });

      // Issue date (right-aligned on same banner)
      const issueDateStr = new Date().toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      doc.font('Helvetica').fontSize(9).fillColor(GRAY_TEXT)
        .text(`Emitido: ${issueDateStr}`, 0, 144, { width: W - M, align: 'right' });

      // ── PLACA HIGHLIGHT BOX ───────────────────────────────────────
      let y = 176;
      const placaBoxW = 180;
      const placaBoxX = (W - placaBoxW) / 2;
      doc.roundedRect(placaBoxX, y, placaBoxW, 54, 8).fill(BLUE_DARK);
      doc.font('Helvetica').fontSize(9).fillColor(GOLD)
        .text('PLACA DEL VEHÍCULO', placaBoxX, y + 8, { width: placaBoxW, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(26).fillColor(WHITE)
        .text(params.placa, placaBoxX, y + 22, { width: placaBoxW, align: 'center', characterSpacing: 4 });

      // ── VEHICLE INFO SECTION ─────────────────────────────────────
      y = 244;
      this._sectionTitle(doc, 'INFORMACIÓN DEL VEHÍCULO', M, y, W - M * 2);
      y += 22;

      const tipoLabel = params.tipoVehiculo === 'MOTOCICLETA' ? 'Motocicleta' : 'Motocarro';
      const actLabel = params.actividad === 'MOTOTAXI' ? 'Mototaxi' : params.actividad === 'FAMILIAR' ? 'Familiar' : (params.actividad || '—');
      const fechaStr = params.fechaCenso.toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      const colW = (W - M * 2 - 12) / 2;
      this._infoRow(doc, 'Tipo de Vehículo', tipoLabel, M, y, colW);
      this._infoRow(doc, 'Actividad', actLabel, M + colW + 12, y, colW);
      y += 46;
      this._infoRow(doc, 'Fecha del Censo', fechaStr, M, y, W - M * 2);
      y += 46;

      // ── VALIDITY SECTION ─────────────────────────────────────────
      this._sectionTitle(doc, 'VALIDEZ Y AUTENTICIDAD', M, y, W - M * 2);
      y += 22;

      // QR on the right, text on the left
      const qrSize = 110;
      const qrX = W - M - qrSize;
      const textColW = W - M * 2 - qrSize - 16;

      doc.font('Helvetica').fontSize(9).fillColor(GRAY_TEXT)
        .text(
          'Este certificado acredita el registro oficial del vehículo en el Sistema Municipal de Censo de Motos. ' +
          'Puede verificar su autenticidad escaneando el código QR o ingresando el código de validación en el portal oficial.',
          M, y, { width: textColW, lineGap: 3 }
        );

      y += 46;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY_TEXT).text('Código de validación:', M, y);
      doc.font('Helvetica').fontSize(9).fillColor(BLUE_MID).text(params.qrToken, M, y + 13);
      doc.font('Helvetica').fontSize(8).fillColor(GRAY_TEXT).text(validationUrl, M, y + 26, {
        link: validationUrl, underline: true, width: textColW,
      });

      if (qrBuffer) {
        doc.image(qrBuffer, qrX, y - 46, { width: qrSize, height: qrSize });
        doc.font('Helvetica').fontSize(7).fillColor(GRAY_TEXT)
          .text('Escanear para validar', qrX, y - 46 + qrSize + 2, { width: qrSize, align: 'center' });
      }

      y += 54;

      // ── NOTES ────────────────────────────────────────────────────
      if (params.notas) {
        y += 8;
        this._sectionTitle(doc, 'OBSERVACIONES', M, y, W - M * 2);
        y += 22;
        doc.font('Helvetica').fontSize(9).fillColor(GRAY_TEXT)
          .text(params.notas, M, y, { width: W - M * 2 });
        y += 30;
      }

      // ── SIGNATURE AREA ───────────────────────────────────────────
      const sigY = H - 140;
      doc.rect(M, sigY - 8, W - M * 2, 1).fill(GRAY_BORDER);

      const sigColW = (W - M * 2 - 24) / 2;

      // Left signature — Alcalde
      const alcaldeNombre = params.alcaldiaData?.alcalde || '________________________________';
      const alcaldeCargo = params.alcaldiaData?.cargo || 'Alcalde Municipal';
      doc.moveTo(M, sigY + 38).lineTo(M + sigColW, sigY + 38).strokeColor(GRAY_BORDER).lineWidth(1).stroke();
      doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY_TEXT)
        .text(alcaldeNombre, M, sigY + 42, { width: sigColW, align: 'center' });
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
        .text(alcaldeCargo, M, sigY + 54, { width: sigColW, align: 'center' });
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
        .text(params.alcaldiaData?.nombre || 'Alcaldía Municipal', M, sigY + 65, { width: sigColW, align: 'center' });

      // Right — Sello (logo image if available, otherwise placeholder circles)
      const sealX = M + sigColW + 24;
      const sealSize = 64;
      const sealImgX = sealX + (sigColW - sealSize) / 2;
      if (logoBuffer) {
        doc.image(logoBuffer, sealImgX, sigY, { width: sealSize, height: sealSize, fit: [sealSize, sealSize] });
      } else {
        doc.circle(sealX + sigColW / 2, sigY + 32, 30).strokeColor(BLUE_DARK).lineWidth(1.5).stroke();
        doc.circle(sealX + sigColW / 2, sigY + 32, 24).strokeColor(BLUE_DARK).lineWidth(0.5).stroke();
        doc.font('Helvetica-Bold').fontSize(7).fillColor(BLUE_DARK)
          .text('SELLO OFICIAL', sealX, sigY + 28, { width: sigColW, align: 'center' });
        doc.font('Helvetica').fontSize(6).fillColor(BLUE_MID)
          .text('ALCALDÍA', sealX, sigY + 38, { width: sigColW, align: 'center' });
      }

      // ── FOOTER BAND ───────────────────────────────────────────────
      doc.rect(0, H - 38, W, 38).fill(BLUE_DARK);
      doc.rect(0, H - 40, W, 2).fill(GOLD);
      doc.font('Helvetica').fontSize(7.5).fillColor('#93c5fd')
        .text(
          'Documento generado electrónicamente — Sin firma manuscrita es válido con código QR de autenticidad',
          0, H - 26, { width: W, align: 'center' }
        );
      doc.font('Helvetica').fontSize(7).fillColor('#bfdbfe')
        .text(
          `Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`,
          0, H - 15, { width: W, align: 'center' }
        );

      doc.end();
    });
  }

  private _sectionTitle(doc: any, title: string, x: number, y: number, w: number) {
    doc.rect(x, y, w, 18).fill(BLUE_LIGHT);
    doc.rect(x, y, 4, 18).fill(BLUE_MID);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(BLUE_DARK)
      .text(title, x + 10, y + 5, { width: w - 10 });
  }

  private _infoRow(doc: any, label: string, value: string, x: number, y: number, w: number) {
    doc.rect(x, y, w, 38).roundedRect(x, y, w, 38, 4).strokeColor(GRAY_BORDER).lineWidth(0.5).stroke();
    doc.rect(x, y, w, 14).roundedRect(x, y, w, 14, 4).fill(GRAY_LIGHT);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#6b7280')
      .text(label.toUpperCase(), x + 8, y + 4, { width: w - 16 });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY_TEXT)
      .text(value, x + 8, y + 18, { width: w - 16 });
  }

  private _drawPlaceholderLogo(doc: any, x: number, y: number) {
    doc.rect(x, y, 70, 70).strokeColor(GOLD).lineWidth(1).stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD)
      .text('ESCUDO\nOFICIAL', x, y + 26, { width: 70, align: 'center' });
  }

  private async generateQrBuffer(url: string): Promise<Buffer | null> {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: { dark: BLUE_DARK, light: WHITE },
        errorCorrectionLevel: 'M',
      });
      const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    } catch (err) {
      this.logger.error('QR generation error', err);
      return null;
    }
  }

  private async fetchLogoBuffer(url?: string): Promise<Buffer | null> {
    if (!url) return null;
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode !== 200) { res.resume(); resolve(null); return; }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', () => resolve(null));
      }).on('error', () => resolve(null));
    });
  }
}
