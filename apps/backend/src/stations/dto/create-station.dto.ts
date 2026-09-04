import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStationDto {
  @ApiProperty({ example: 'Estación Central' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: 'Calle 10 #5-20, Sabanalarga' })
  @IsString()
  @IsNotEmpty({ message: 'La ubicación es requerida' })
  ubicacion: string;

  @ApiPropertyOptional({ example: 'Estación principal del municipio' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
