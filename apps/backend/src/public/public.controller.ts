import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configuración pública de la alcaldía (logo, nombre)' })
  async getSettings() {
    return this.publicService.getPublicSettings();
  }

  @Get('censos/placa/:placa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar censo por placa (público)' })
  @ApiResponse({ status: 200, description: 'Censo encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró censo para esta placa' })
  async findByPlaca(@Param('placa') placa: string) {
    return this.publicService.findByPlaca(placa);
  }

  @Get('censos/codigo/:codigo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar censo por código (público)' })
  @ApiResponse({ status: 200, description: 'Censo encontrado' })
  @ApiResponse({ status: 404, description: 'Censo no encontrado' })
  async findByCodigo(@Param('codigo') codigo: string) {
    return this.publicService.findByCodigo(codigo);
  }

  @Get('validar/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar certificado por token QR (público)' })
  @ApiResponse({ status: 200, description: 'Resultado de validación' })
  @ApiResponse({ status: 404, description: 'Certificado no encontrado' })
  async validateToken(@Param('token') token: string) {
    return this.publicService.validateToken(token);
  }
}
