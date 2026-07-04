import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @ApiPropertyOptional({
    example: 300000,
    description:
      'Budget mensuel manuel. Ignoré si revenuMensuel et objectifEpargne sont fournis : ' +
      'il est alors calculé automatiquement (revenuMensuel - objectifEpargne).',
  })
  @IsOptional()
  @IsNumber()
  montantMensuel?: number;

  @ApiPropertyOptional({
    example: 10000,
    description:
      'Budget journalier manuel. Ignoré si revenuMensuel et objectifEpargne sont fournis : ' +
      'il est alors calculé automatiquement (montantMensuel / jours restants du mois).',
  })
  @IsOptional()
  @IsNumber()
  montantJournalier?: number;

  @ApiPropertyOptional({
    example: 250000,
    description: 'Revenu prévu pour le mois. Combiné à objectifEpargne pour calculer le budget automatiquement.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revenuMensuel?: number;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Objectif d\'épargne pour le mois. Combiné à revenuMensuel pour calculer le budget automatiquement.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  objectifEpargne?: number;

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
