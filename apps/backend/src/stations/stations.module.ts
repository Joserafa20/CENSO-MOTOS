import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}
