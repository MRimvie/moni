import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const joursRestants = this.getJoursRestantsDansMois(dto.mois, dto.annee);
    const montantJournalier = dto.montantMensuel / joursRestants;

    return this.prisma.budget.create({
      data: {
        montantMensuel: dto.montantMensuel,
        montantJournalier,
        mois: dto.mois,
        annee: dto.annee,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.budget.findUnique({
      where: { id },
    });
  }

  async getOrCreateBudget(userId: string, mois: number, annee: number) {
    let budget = await this.prisma.budget.findUnique({
      where: {
        userId_mois_annee: {
          userId,
          mois,
          annee,
        },
      },
    });

    if (!budget) {
      const joursRestants = this.getJoursRestantsDansMois(mois, annee);
      const montantMensuelDefaut = 100000;
      const montantJournalier = montantMensuelDefaut / joursRestants;

      budget = await this.prisma.budget.create({
        data: {
          montantMensuel: montantMensuelDefaut,
          montantJournalier,
          mois,
          annee,
          userId,
        },
      });
    }

    return budget;
  }

  async updateMontantUtilise(budgetId: string, montantDepense: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    return this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        montantUtilise: budget.montantUtilise + montantDepense,
      },
    });
  }

  async recalculerBudgetJournalier(budgetId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    const joursRestants = this.getJoursRestantsDansMois(budget.mois, budget.annee);
    const montantRestant = budget.montantMensuel - budget.montantUtilise;
    const nouveauMontantJournalier = Math.max(0, montantRestant / joursRestants);

    return this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        montantJournalier: nouveauMontantJournalier,
      },
    });
  }

  private getJoursRestantsDansMois(mois: number, annee: number): number {
    const maintenant = new Date();
    const debutMois = new Date(annee, mois - 1, 1);
    const finMois = new Date(annee, mois, 0);

    if (maintenant < debutMois) {
      return finMois.getDate();
    }

    if (maintenant > finMois) {
      return 1;
    }

    const joursRestants = finMois.getDate() - maintenant.getDate() + 1;
    return Math.max(1, joursRestants);
  }
}
