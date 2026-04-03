import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EpargneService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.epargne.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getTotalEpargne(userId: string) {
    const epargnes = await this.prisma.epargne.findMany({
      where: { userId },
    });

    return epargnes.reduce((sum, epargne) => sum + epargne.montant, 0);
  }

  async ajouterEpargneAutomatique(userId: string, montant: number) {
    if (montant <= 0) return null;

    return this.prisma.epargne.create({
      data: {
        montant,
        objectif: 'Épargne automatique',
        userId,
      },
    });
  }

  async ajouterEpargneManuelle(userId: string, montant: number, objectif?: string) {
    return this.prisma.epargne.create({
      data: {
        montant,
        objectif: objectif || 'Épargne manuelle',
        userId,
      },
    });
  }
}
