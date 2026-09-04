import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateCertificateDto {
  @ApiPropertyOptional({ description: 'Notas adicionales para el certificado' })
  @IsOptional()
  @IsString()
  notes?: string;
}
