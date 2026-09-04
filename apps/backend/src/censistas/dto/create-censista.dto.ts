import {
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCensistaDto {
  @ApiProperty({ example: 'María García' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty({ message: 'El documento es requerido' })
  documento: string;

  @ApiProperty({ example: 'mariagarcia' })
  @IsString()
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
