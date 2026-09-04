import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticsFiltersDto {
  @ApiPropertyOptional({ description: 'Fecha de inicio del rango (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaInicial?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del rango (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaFinal?: string;

  @ApiPropertyOptional({ enum: ['MOTOCICLETA', 'MOTOCARRO'], description: 'Tipo de vehículo' })
  @IsOptional()
  @IsEnum(['MOTOCICLETA', 'MOTOCARRO'])
  tipoVehiculo?: string;

  @ApiPropertyOptional({ enum: ['MOTOTAXI', 'FAMILIAR'], description: 'Actividad' })
  @IsOptional()
  @IsEnum(['MOTOTAXI', 'FAMILIAR'])
  actividad?: string;

  @ApiPropertyOptional({ description: 'ID de la estación' })
  @IsOptional()
  @IsString()
  estacion?: string;

  @ApiPropertyOptional({ enum: ['DIURNO', 'NOCTURNO'], description: 'Horario' })
  @IsOptional()
  @IsEnum(['DIURNO', 'NOCTURNO'])
  horario?: string;

  @ApiPropertyOptional({ description: 'Solo documentos al día' })
  @IsOptional()
  @IsBoolean()
  documentosAlDia?: boolean;

  @ApiPropertyOptional({ description: 'ID del censista' })
  @IsOptional()
  @IsString()
  censistaId?: string;
}
