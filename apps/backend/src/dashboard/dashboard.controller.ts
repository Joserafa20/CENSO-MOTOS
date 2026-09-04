import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  @ApiResponse({ status: 200, description: 'Estadísticas del dashboard' })
  async getDashboardStats(@Query() filters: StatisticsFiltersDto) {
    return this.dashboardService.getDashboardStats(filters);
  }

  @Get('estadisticas')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener estadísticas detalladas por categoría' })
  @ApiResponse({ status: 200, description: 'Estadísticas detalladas' })
  async getStatistics(@Query() filters: StatisticsFiltersDto) {
    return this.dashboardService.getStatistics(filters);
  }
}
