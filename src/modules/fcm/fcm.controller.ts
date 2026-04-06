import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FcmService } from './fcm.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegisterTokenDto } from './dto/register-token.dto';

@ApiTags('FCM')
@ApiBearerAuth()
@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @Post('register-token')
  @ApiOperation({ summary: 'Enregistrer un token FCM' })
  async registerToken(
    @CurrentUser() user: any,
    @Body() dto: RegisterTokenDto,
  ) {
    return this.fcmService.registerToken(user.id, dto.token);
  }

  @Patch('unregister-token/:token')
  @ApiOperation({ summary: 'Supprimer un token FCM' })
  async unregisterToken(@Param('token') token: string) {
    return this.fcmService.unregisterToken(token);
  }
}
