import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FinalizeCensusDto {
  @ApiPropertyOptional({ description: 'Notas adicionales al finalizar el censo' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
