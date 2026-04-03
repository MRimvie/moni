import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+22670123456', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}
