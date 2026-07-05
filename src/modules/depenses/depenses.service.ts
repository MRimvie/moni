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
    const pourcentageUtilise =
      budgetUpdated.montantMensuel > 0
        ? (budgetUpdated.montantUtilise / budgetUpdated.montantMensuel) * 100
        : 0;

    // Seuils mensuels : une seule notification par seuil et par mois.
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    if (pourcentageUtilise >= 100) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_100',
        `Budget du mois dépassé : ${Math.round(budgetUpdated.montantUtilise)} FCFA dépensés sur ${Math.round(budgetUpdated.montantMensuel)} FCFA.`,
        debutMois,
      );
    } else if (pourcentageUtilise >= 80) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_80',
        'Attention ! Vous avez utilisé 80% de votre budget mensuel.',
        debutMois,
      );
    } else if (pourcentageUtilise >= 50) {
      await this.notificationsService.createBudgetNotification(
        userId,
        'BUDGET_50',
        'Vous avez utilisé la moitié de votre budget mensuel.',
        debutMois,
      );
    }

    // La logique journalière ne s'applique que si la dépense date d'aujourd'hui.
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    if (depense.date >= debutJour) {
      const depensesJour = await this.getDepensesJour(userId);
      const depensesJourAvant = depensesJour - depense.montant;

      // Dépassement du budget du jour : notifié au franchissement, une fois par jour.
      if (
        budgetUpdated.montantJournalier > 0 &&
        depensesJourAvant <= budgetUpdated.montantJournalier &&
        depensesJour > budgetUpdated.montantJournalier
      ) {
        await this.notificationsService.createBudgetNotification(
          userId,
          'DEPASSE',
          `Budget du jour dépassé : ${Math.round(depensesJour)} FCFA dépensés sur ${Math.round(budgetUpdated.montantJournalier)} FCFA prévus.`,
          debutJour,
        );
      }

      // Maintient l'épargne provisoire du jour (budget journalier - dépenses)
      // en une seule ligne, mise à jour au fil des dépenses.
      await this.epargneService.syncEpargneAutomatiqueDuJour(
        userId,
        budgetUpdated.montantJournalier - depensesJour,
      );
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
