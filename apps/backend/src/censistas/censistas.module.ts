import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CensistasService } from './censistas.service';
import { CensistasController } from './censistas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CensistasController],
  providers: [CensistasService],
  exports: [CensistasService],
})
export class CensistasModule {}
