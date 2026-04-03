import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { CategorieDepense } from '@prisma/client';

export class CreateDepenseDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  montant: number;

  @ApiProperty({ enum: CategorieDepense, example: CategorieDepense.ALIMENTATION })
  @IsEnum(CategorieDepense)
  categorie: CategorieDepense;

  @ApiProperty({ example: 'Achat de nourriture', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-04-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;
}
