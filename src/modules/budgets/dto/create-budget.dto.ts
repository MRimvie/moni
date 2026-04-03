import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({ example: 300000 })
  @IsNumber()
  montantMensuel: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(12)
  mois: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2020)
  annee: number;
}
