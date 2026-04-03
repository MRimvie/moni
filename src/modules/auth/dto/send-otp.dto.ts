import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+22670123456', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
