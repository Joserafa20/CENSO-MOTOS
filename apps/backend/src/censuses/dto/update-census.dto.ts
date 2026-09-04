import { PartialType } from '@nestjs/swagger';

import { CreateCensusDto } from './create-census.dto';

export class UpdateCensusDto extends PartialType(CreateCensusDto) {}
