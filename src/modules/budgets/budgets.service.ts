import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        montantMensuel: dto.montantMensuel,
        montantJournalier: dto.montantJournalier,
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
      const montantMensuelDefaut = 100000;
      const montantJournalierDefaut = 3500;

      budget = await this.prisma.budget.create({
        data: {
          montantMensuel: montantMensuelDefaut,
          montantJournalier: montantJournalierDefaut,
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

  async updateBudgetJournalier(budgetId: string, montantJournalier: number) {
    return this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        montantJournalier,
      },
    });
  }

  async getProgression(userId: string) {
    const now = new Date();
    const mois = now.getMonth() + 1;
    const annee = now.getFullYear();

    // Récupérer ou créer le budget du mois
    const budget = await this.getOrCreateBudget(userId, mois, annee);

    // Calculer les dépenses du mois
    const startOfMonth = new Date(annee, mois - 1, 1);
    const endOfMonth = new Date(annee, mois, 0, 23, 59, 59);

    const depenses = await this.prisma.depense.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
    const pourcentage = budget.montantMensuel > 0 
      ? (totalDepenses / budget.montantMensuel) * 100 
      : 0;

    let status = 'Bon';
    if (pourcentage >= 100) status = 'Dépassé';
    else if (pourcentage >= 80) status = 'Attention';
    else if (pourcentage >= 50) status = 'Modéré';

    return {
      budgetMensuel: budget.montantMensuel,
      budgetJournalier: budget.montantJournalier,
      montantUtilise: totalDepenses,
      montantRestant: Math.max(0, budget.montantMensuel - totalDepenses),
      pourcentage: Math.round(pourcentage * 10) / 10,
      status,
      mois,
      annee,
    };
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
