import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'alcaldia-config';

const DEFAULTS = {
  id: SINGLETON_ID,
  nombre: 'Alcaldía Municipal de Sabanalarga',
  nit: null,
  municipio: 'Sabanalarga',
  departamento: 'Atlántico',
  alcalde: null,
  cargo: null,
  logoUrl: null,
  selloUrl: null,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const config = await this.prisma.configuracionAlcaldia.findFirst();
    return config ?? DEFAULTS;
  }

  async update(dto: UpdateSettingsDto) {
    return this.prisma.configuracionAlcaldia.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        nombre: dto.nombre ?? DEFAULTS.nombre,
        nit: dto.nit ?? null,
        municipio: dto.municipio ?? DEFAULTS.municipio,
        departamento: dto.departamento ?? DEFAULTS.departamento,
        alcalde: dto.alcalde ?? null,
        cargo: dto.cargo ?? null,
        logoUrl: dto.logoUrl ?? null,
        selloUrl: dto.selloUrl ?? null,
      },
      update: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
        ...(dto.nit !== undefined && { nit: dto.nit }),
        ...(dto.municipio !== undefined && { municipio: dto.municipio }),
        ...(dto.departamento !== undefined && { departamento: dto.departamento }),
        ...(dto.alcalde !== undefined && { alcalde: dto.alcalde }),
        ...(dto.cargo !== undefined && { cargo: dto.cargo }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.selloUrl !== undefined && { selloUrl: dto.selloUrl }),
      },
    });
  }
}
