import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EpargneService } from './epargne.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Epargne')
@ApiBearerAuth()
@Controller('epargne')
export class EpargneController {
  constructor(private readonly epargneService: EpargneService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les épargnes' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.epargneService.findAll(user.id, startDate, endDate);
  }

  @Get('total')
  @ApiOperation({ summary: 'Obtenir le total épargné' })
  async getTotal(@CurrentUser() user: any) {
    const total = await this.epargneService.getTotalEpargne(user.id);
    return { total };
  }

  @Get('calcul-journalier')
  @ApiOperation({ summary: 'Calculer l\'épargne du jour' })
  async calculerEpargneJour(@CurrentUser() user: any) {
    return this.epargneService.calculerEpargneJournaliere(user.id);
  }

  @Get('historique')
  @ApiOperation({ summary: 'Obtenir l\'historique des épargnes par jour' })
  async getHistorique(@CurrentUser() user: any) {
    return this.epargneService.getHistoriqueParJour(user.id);
  }
}
