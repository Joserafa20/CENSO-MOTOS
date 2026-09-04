import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CensusesModule } from './censuses/censuses.module';
import { AuditModule } from './audit/audit.module';
import { CertificatesModule } from './certificates/certificates.module';
import { PublicModule } from './public/public.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StationsModule } from './stations/stations.module';
import { CensistasModule } from './censistas/censistas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AuditModule,
    CensusesModule,
    CertificatesModule,
    PublicModule,
    DashboardModule,
    StationsModule,
    CensistasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
