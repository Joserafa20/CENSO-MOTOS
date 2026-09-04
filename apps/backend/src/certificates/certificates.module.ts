import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { CertificatePdfService } from './pdf/certificate-pdf.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificatePdfService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
