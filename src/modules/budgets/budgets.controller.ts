import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un budget' })
  async create(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les budgets' })
  async findAll(@CurrentUser() user: any) {
    return this.budgetsService.findAll(user.id);
  }
}
