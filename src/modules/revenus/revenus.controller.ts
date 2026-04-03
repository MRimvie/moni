import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RevenusService } from './revenus.service';
import { CreateRevenuDto } from './dto/create-revenu.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Revenus')
@ApiBearerAuth()
@Controller('revenus')
export class RevenusController {
  constructor(private readonly revenusService: RevenusService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un revenu' })
  async create(@CurrentUser() user: any, @Body() dto: CreateRevenuDto) {
    return this.revenusService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les revenus' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.revenusService.findAll(user.id, startDate, endDate);
  }
}
