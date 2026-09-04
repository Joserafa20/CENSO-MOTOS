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
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@ApiTags('Stations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/estaciones')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva estación' })
  @ApiResponse({ status: 201, description: 'Estación creada exitosamente' })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todas las estaciones' })
  @ApiResponse({ status: 200, description: 'Lista de estaciones' })
  findAll() {
    return this.stationsService.findAll();
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una estación' })
  @ApiResponse({ status: 200, description: 'Estación actualizada' })
  @ApiResponse({ status: 404, description: 'Estación no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStationDto: UpdateStationDto,
  ) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Patch(':id/estado')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cambiar estado de la estación (activa/inactiva)' })
  @ApiResponse({ status: 200, description: 'Estado de estación actualizado' })
  @ApiResponse({ status: 404, description: 'Estación no encontrada' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.stationsService.toggleStatus(id);
  }
}
