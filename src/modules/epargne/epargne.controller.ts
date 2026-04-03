import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EpargneService } from './epargne.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Epargne')
@ApiBearerAuth()
@Controller('epargne')
export class EpargneController {
  constructor(private readonly epargneService: EpargneService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les épargnes' })
  async findAll(@CurrentUser() user: any) {
    return this.epargneService.findAll(user.id);
  }

  @Get('total')
  @ApiOperation({ summary: 'Obtenir le total épargné' })
  async getTotal(@CurrentUser() user: any) {
    const total = await this.epargneService.getTotalEpargne(user.id);
    return { total };
  }
}
