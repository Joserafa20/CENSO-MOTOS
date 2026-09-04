import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  documento: string;

  @ApiProperty({ example: 'juanperez' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'CENSISTA', enum: ['ADMIN', 'CENSISTA'] })
  @IsEnum(['ADMIN', 'CENSISTA'])
  rol: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
