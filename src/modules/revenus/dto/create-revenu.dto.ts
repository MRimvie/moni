import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsBoolean, IsString, IsDateString } from 'class-validator';
import { TypeRevenu } from '@prisma/client';

export class CreateRevenuDto {
  @ApiProperty({ example: 500000 })
  @IsNumber()
  montant: number;

  @ApiProperty({ enum: TypeRevenu, example: TypeRevenu.SALAIRE })
  @IsEnum(TypeRevenu)
  type: TypeRevenu;

  @ApiProperty({ example: '2024-04-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  recurrent?: boolean;

  @ApiProperty({ example: 'Salaire du mois', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
