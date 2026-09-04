import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async seed(@Query('key') key: string) {
    // Simple protection: only allow with correct key
    const secretKey = process.env.SEED_KEY || 'censo-motos-seed-2026';
    if (key !== secretKey) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Create admin user
      const adminPassword = 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      const adminUser = await this.prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          nombre: 'Administrador',
          documento: '00000000',
          username: 'admin',
          passwordHash,
          rol: 'ADMIN',
          estado: true,
        },
      });

      return {
        success: true,
        message: 'Database seeded successfully!',
        user: {
          id: adminUser.id,
          username: adminUser.username,
          password: adminPassword,
        },
      };
    } catch (error) {
      throw new HttpException(`Seed failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
