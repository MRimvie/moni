import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EpargneService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.epargne.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getTotalEpargne(userId: string) {
    const epargnes = await this.prisma.epargne.findMany({
      where: { userId },
    });

    return epargnes.reduce((sum, epargne) => sum + epargne.montant, 0);
  }

  /**
   * Maintient l'épargne automatique du jour en UNE seule ligne par utilisateur :
   * mise à jour au fil des dépenses (et non ajoutée à chaque dépense, ce qui
   * comptait l'épargne plusieurs fois). Si le budget du jour est dépassé,
   * la ligne du jour est supprimée.
   */
  async syncEpargneAutomatiqueDuJour(userId: string, montant: number) {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const finJour = new Date();
    finJour.setHours(23, 59, 59, 999);

    const existante = await this.prisma.epargne.findFirst({
      where: {
        userId,
        objectif: 'Épargne automatique',
        date: { gte: debutJour, lte: finJour },
      },
    });

    if (montant <= 0) {
      if (existante) {
        await this.prisma.epargne.delete({ where: { id: existante.id } });
      }
      return null;
    }

    const arrondi = Math.round(montant * 100) / 100;

    if (existante) {
      return this.prisma.epargne.update({
        where: { id: existante.id },
        data: { montant: arrondi },
      });
    }

    return this.prisma.epargne.create({
      data: {
        montant: arrondi,
        objectif: 'Épargne automatique',
        userId,
      },
    });
  }

  async ajouterEpargneManuelle(userId: string, montant: number, objectif?: string) {
    const epargne = await this.prisma.epargne.create({
      data: {
        montant,
        objectif: objectif || 'Épargne manuelle',
        userId,
      },
    });

    await this.notificationsService.createNotification(
      userId,
      'EPARGNE',
      `Bravo ! Vous venez de mettre ${Math.round(montant)} FCFA de côté.`,
    );

    return epargne;
  }

  async calculerEpargneJournaliere(userId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const mois = today.getMonth() + 1;
    const annee = today.getFullYear();

    // Récupérer le budget du mois
    const budget = await this.prisma.budget.findFirst({
      where: {
        userId,
        mois,
        annee,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!budget) {
      return {
        budgetJournalier: 0,
        depensesJour: 0,
        epargneJour: 0,
        date: today,
      };
    }

    // Calculer les dépenses du jour
    const depensesJour = await this.prisma.depense.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalDepenses = depensesJour.reduce((sum, d) => sum + d.montant, 0);
    const epargneJour = budget.montantJournalier - totalDepenses;

    return {
      budgetJournalier: budget.montantJournalier,
      depensesJour: totalDepenses,
      epargneJour: epargneJour > 0 ? epargneJour : 0,
      date: today,
    };
  }

  async getHistoriqueParJour(userId: string, jours: number = 30) {
    const historique = [];
    const today = new Date();

    for (let i = 0; i < jours; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      const mois = date.getMonth() + 1;
      const annee = date.getFullYear();

      // Récupérer le budget pour ce jour
      const budget = await this.prisma.budget.findFirst({
        where: {
          userId,
          mois,
          annee,
        },
      });

      // Calculer les dépenses du jour
      const depenses = await this.prisma.depense.findMany({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
      const budgetJournalier = budget?.montantJournalier || 0;
      const epargne = budgetJournalier - totalDepenses;

      historique.push({
        date: startOfDay,
        budgetJournalier,
        depenses: totalDepenses,
        epargne: epargne > 0 ? epargne : 0,
        pourcentageUtilise: budgetJournalier > 0 
          ? Math.round((totalDepenses / budgetJournalier) * 100) 
          : 0,
      });
    }

    return historique;
  }
}
