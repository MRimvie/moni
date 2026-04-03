import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepenseDto } from './dto/create-depense.dto';
import { BudgetsService } from '../budgets/budgets.service';
import { EpargneService } from '../epargne/epargne.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConseilsService } from '../conseils/conseils.service';
import { CategorieDepense } from '@prisma/client';

@Injectable()
export class DepensesService {
  constructor(
    private prisma: PrismaService,
    private budgetsService: BudgetsService,
    private epargneService: EpargneService,
    private notificationsService: NotificationsService,
    private conseilsService: ConseilsService,
  ) {}

  async create(userId: string, dto: CreateDepenseDto) {
    const depense = await this.prisma.depense.create({
      data: {
        ...dto,
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });

    const now = new Date();
    const budget = await this.budgetsService.getOrCreateBudget(
      userId,
      now.getMonth() + 1,
      now.getFullYear(),
    );

    await this.budgetsService.updateMontantUtilise(budget.id, depense.montant);

    const budgetUpdated = await this.budgetsService.findOne(budget.id);
    const pourcentageUtilise = (budgetUpdated.montantUtilise / budgetUpdated.montantMensuel) * 100;

    if (pourcentageUtilise >= 100) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_100',
        'Vous avez atteint 100% de votre budget mensuel!',
      );
    } else if (pourcentageUtilise >= 80) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_80',
        'Attention! Vous avez utilisé 80% de votre budget mensuel.',
      );
    } else if (pourcentageUtilise >= 50) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_50',
        'Vous avez utilisé 50% de votre budget mensuel.',
      );
    } else if (pourcentageUtilise >= 10) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_10',
        'Vous avez commencé à utiliser votre budget mensuel.',
      );
    }

    const depensesJour = await this.getDepensesJour(userId);
    if (depensesJour < budgetUpdated.montantJournalier) {
      const reste = budgetUpdated.montantJournalier - depensesJour;
      await this.epargneService.ajouterEpargneAutomatique(userId, reste);
    }

    await this.conseilsService.genererConseilsAutomatiques(userId);

    return depense;
  }

  async findAll(userId: string, startDate?: string, endDate?: string, categorie?: CategorieDepense) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (categorie) {
      where.categorie = categorie;
    }

    return this.prisma.depense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getDepensesJour(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const depenses = await this.prisma.depense.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return depenses.reduce((sum, depense) => sum + depense.montant, 0);
  }

  async getDepensesByCategorie(userId: string, mois: number, annee: number) {
    const startDate = new Date(annee, mois - 1, 1);
    const endDate = new Date(annee, mois, 0, 23, 59, 59);

    const depenses = await this.prisma.depense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const byCategorie: Record<string, number> = {};
    depenses.forEach((depense) => {
      if (!byCategorie[depense.categorie]) {
        byCategorie[depense.categorie] = 0;
      }
      byCategorie[depense.categorie] += depense.montant;
    });

    return byCategorie;
  }
}
