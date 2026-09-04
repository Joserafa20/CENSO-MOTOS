import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';

@ApiTags('certificates')
@Controller('api/certificados')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate/:censusId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CENSISTA', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar un certificado para un censo' })
  @ApiResponse({ status: 201, description: 'Certificado generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Censo no válido para generar certificado' })
  @ApiResponse({ status: 404, description: 'Censo no encontrado' })
  @ApiResponse({ status: 409, description: 'El censo ya tiene un certificado' })
  async generate(
    @Param('censusId') censusId: string,
    @CurrentUser('id') userId: string,
    @Body() dto?: GenerateCertificateDto,
  ) {
    return this.certificatesService.generateCertificate(censusId, userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CENSISTA', 'ADMIN')
  @ApiOperation({ summary: 'Obtener un certificado por ID' })
  @ApiResponse({ status: 200, description: 'Certificado encontrado' })
  @ApiResponse({ status: 404, description: 'Certificado no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.certificatesService.getCertificate(id);
  }

  @Get(':id/download')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CENSISTA', 'ADMIN')
  @ApiOperation({ summary: 'Descargar certificado en PDF' })
  @ApiResponse({ status: 200, description: 'PDF del certificado' })
  @ApiResponse({ status: 404, description: 'Certificado no encontrado' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const result = await this.certificatesService.downloadCertificate(id);

    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    });

    res.send(result.buffer);
  }
}
