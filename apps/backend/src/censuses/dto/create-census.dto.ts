import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCensusDto {
  @ApiProperty({
    example: 'ABC123',
    description: 'Placa del vehículo en mayúsculas',
  })
  @IsString()
  @IsNotEmpty({ message: 'La placa es requerida' })
  @Matches(/^[A-Z0-9]+$/, { message: 'La placa solo debe contener letras mayúsculas y números' })
  placa: string;

  @ApiProperty({ enum: ['MOTOCICLETA', 'MOTOCARRO'], description: 'Tipo de vehículo' })
  @IsEnum(['MOTOCICLETA', 'MOTOCARRO'], {
    message: 'Tipo de vehículo inválido. Debe ser MOTOCICLETA o MOTOCARRO',
  })
  tipoVehiculo: string;

  @ApiPropertyOptional({
    enum: ['MOTOTAXI', 'FAMILIAR'],
    description: 'Actividad (requerida para MOTOCICLETA)',
  })
  @IsOptional()
  @IsEnum(['MOTOTAXI', 'FAMILIAR'], {
    message: 'Actividad inválida. Debe ser MOTOTAXI o FAMILIAR',
  })
  actividad?: string;

  @ApiPropertyOptional({
    enum: ['PROPIA', 'PAGA_TARIFA'],
    description: 'Propiedad del vehículo',
  })
  @IsOptional()
  @IsEnum(['PROPIA', 'PAGA_TARIFA'], {
    message: 'Propiedad inválida. Debe ser PROPIA o PAGA_TARIFA',
  })
  propiedad?: string;

  @ApiPropertyOptional({
    enum: ['ESTACION', 'CIRCULANTE'],
    description: 'Modalidad de trabajo',
  })
  @IsOptional()
  @IsEnum(['ESTACION', 'CIRCULANTE'], {
    message: 'Modalidad inválida. Debe ser ESTACION o CIRCULANTE',
  })
  modalidad?: string;

  @ApiPropertyOptional({ description: 'Valor de la tarifa (requerido si propiedad es PAGA_TARIFA)' })
  @IsOptional()
  @IsNumber({}, { message: 'El valor de tarifa debe ser un número' })
  @Min(0.01, { message: 'El valor de tarifa debe ser mayor a 0' })
  valorTarifa?: number;

  @ApiPropertyOptional({ description: 'Nombre de la estación (texto libre)' })
  @IsOptional()
  @IsString()
  estacionNombre?: string;

  @ApiPropertyOptional({ description: 'Documentos al día del vehículo' })
  @IsOptional()
  @IsBoolean({ message: 'Documentos al día debe ser true o false' })
  documentosAlDia?: boolean;

  @ApiPropertyOptional({
    enum: ['DIURNO', 'NOCTURNO'],
    description: 'Horario de trabajo',
  })
  @IsOptional()
  @IsEnum(['DIURNO', 'NOCTURNO'], {
    message: 'Horario inválido. Debe ser DIURNO o NOCTURNO',
  })
  horario?: string;

  @ApiPropertyOptional({ description: 'Latitud de ubicación' })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({ description: 'Longitud de ubicación' })
  @IsOptional()
  @IsNumber()
  longitud?: number;
}
