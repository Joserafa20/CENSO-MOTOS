import { PartialType } from '@nestjs/swagger';
import { CreateCensistaDto } from './create-censista.dto';

export class UpdateCensistaDto extends PartialType(CreateCensistaDto) {}
