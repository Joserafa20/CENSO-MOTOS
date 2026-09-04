import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CensusesService } from './censuses.service';
import { CreateCensusDto } from './dto/create-census.dto';
import { UpdateCensusDto } from './dto/update-census.dto';
import { FinalizeCensusDto } from './dto/finalize-census.dto';

@ApiTags('censuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('censuses')
export class CensusesController {
  constructor(private readonly censusesService: CensusesService) {}

  @Post()
  @Roles('CENSISTA')
  @ApiOperation({ summary: 'Crear un nuevo censo' })
  @ApiResponse({ status: 201, description: 'Censo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  @ApiResponse({ status: 409, description: 'Placa ya registrada' })
  async create(
    @Body() createCensusDto: CreateCensusDto,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    return this.censusesService.create(
      createCensusDto,
      userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get()
  @Roles('CENSISTA')
  @ApiOperation({ summary: 'Listar censos del censista actual' })
  @ApiQuery({ name: 'estado', required: false, enum: ['BORRADOR', 'FINALIZADO', 'CERTIFICADO_GENERADO'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.censusesService.findAllByUser(userId, {
      estado,
      search,
      fechaDesde,
      fechaHasta,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @Roles('CENSISTA', 'ADMIN')
  @ApiOperation({ summary: 'Obtener un censo por ID' })
  @ApiResponse({ status: 200, description: 'Censo encontrado' })
  @ApiResponse({ status: 404, description: 'Censo no encontrado' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('rol') userRol: string,
  ) {
    return this.censusesService.findOne(id, userId, userRol);
  }

  @Put(':id')
  @Roles('CENSISTA')
  @ApiOperation({ summary: 'Actualizar un censo' })
  @ApiResponse({ status: 200, description: 'Censo actualizado' })
  @ApiResponse({ status: 400, description: 'Error de validación o censo no modificable' })
  @ApiResponse({ status: 404, description: 'Censo no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateCensusDto: UpdateCensusDto,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    return this.censusesService.update(
      id,
      updateCensusDto,
      userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/finalize')
  @Roles('CENSISTA')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar un censo' })
  @ApiResponse({ status: 200, description: 'Censo finalizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Censo no válido para finalizar' })
  @ApiResponse({ status: 404, description: 'Censo no encontrado' })
  async finalize(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    return this.censusesService.finalize(
      id,
      userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('admin/all')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los censos (admin)' })
  @ApiQuery({ name: 'estado', required: false, enum: ['BORRADOR', 'FINALIZADO', 'CERTIFICADO_GENERADO'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllAdmin(
    @Query('estado') estado?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.censusesService.findAllAdmin({
      estado,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
