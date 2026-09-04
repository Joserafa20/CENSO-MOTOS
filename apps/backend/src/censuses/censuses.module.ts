import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { CensusesService } from './censuses.service';
import { CensusesController } from './censuses.controller';
import { BusinessRulesService } from './rules/business-rules.service';

@Module({
  imports: [PrismaModule, AuditModule, CertificatesModule],
  controllers: [CensusesController],
  providers: [CensusesService, BusinessRulesService],
  exports: [CensusesService],
})
export class CensusesModule {}
