import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConseilsService } from './conseils.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Conseils')
@ApiBearerAuth()
@Controller('conseils')
export class ConseilsController {
  constructor(private readonly conseilsService: ConseilsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir les conseils financiers' })
  async findAll(@CurrentUser() user: any) {
    return this.conseilsService.findAll(user.id);
  }
}
