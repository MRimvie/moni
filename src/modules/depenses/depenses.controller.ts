import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DepensesService } from './depenses.service';
import { CreateDepenseDto } from './dto/create-depense.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CategorieDepense } from '@prisma/client';

@ApiTags('Depenses')
@ApiBearerAuth()
@Controller('depenses')
export class DepensesController {
  constructor(private readonly depensesService: DepensesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une dépense' })
  async create(@CurrentUser() user: any, @Body() dto: CreateDepenseDto) {
    return this.depensesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les dépenses' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'categorie', enum: CategorieDepense, required: false })
  async findAll(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categorie') categorie?: CategorieDepense,
  ) {
    return this.depensesService.findAll(user.id, startDate, endDate, categorie);
  }
}
