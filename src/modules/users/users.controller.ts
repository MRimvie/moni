import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Obtenir le profil utilisateur' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
