import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTokenDto {
  @ApiProperty({ description: 'Token FCM du device' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
