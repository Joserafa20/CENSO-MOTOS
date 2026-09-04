import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CensistasService } from './censistas.service';
import { CreateCensistaDto } from './dto/create-censista.dto';
import { UpdateCensistaDto } from './dto/update-censista.dto';

@ApiTags('Censistas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/censistas')
export class CensistasController {
  constructor(private readonly censistasService: CensistasService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo censista' })
  @ApiResponse({ status: 201, description: 'Censista creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Username o documento ya existe' })
  create(@Body() createCensistaDto: CreateCensistaDto) {
    return this.censistasService.create(createCensistaDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los censistas con estadísticas' })
  @ApiResponse({ status: 200, description: 'Lista de censistas' })
  findAll() {
    return this.censistasService.findAll();
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un censista' })
  @ApiResponse({ status: 200, description: 'Censista actualizado' })
  @ApiResponse({ status: 404, description: 'Censista no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCensistaDto: UpdateCensistaDto,
  ) {
    return this.censistasService.update(id, updateCensistaDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activar/desactivar un censista' })
  @ApiResponse({ status: 200, description: 'Estado del censista actualizado' })
  @ApiResponse({ status: 404, description: 'Censista no encontrado' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.censistasService.toggleStatus(id);
  }
}
