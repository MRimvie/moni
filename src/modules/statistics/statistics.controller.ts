import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Statistics')
@ApiBearerAuth()
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('chart-data')
  @ApiOperation({ summary: 'Obtenir les données pour le graphique (dépenses et épargnes)' })
  @ApiQuery({ name: 'period', enum: ['7days', '30days', '90days', '1year'], required: false })
  async getChartData(
    @CurrentUser() user: any,
    @Query('period') period?: string,
  ) {
    return this.statisticsService.getChartData(user.id, period || '30days');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtenir le résumé des statistiques' })
  async getSummary(@CurrentUser() user: any) {
    return this.statisticsService.getSummary(user.id);
  }
}
