import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EpargneService } from './epargne.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EpargneCronService {
  private readonly logger = new Logger(EpargneCronService.name);

  constructor(
    private prisma: PrismaService,
    private epargneService: EpargneService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Bilan de fin de journée (20h) : pour chaque utilisateur ayant un budget ce
   * mois-ci, si ses dépenses du jour sont restées sous son budget journalier,
   * l'épargne du jour est consolidée et une notification de félicitations est
   * envoyée (une seule par jour). Couvre aussi les jours sans aucune dépense,
   * où aucune requête ne déclenche la logique d'épargne.
   */
  @Cron('0 20 * * *')
  async cloturerJournee() {
    const now = new Date();
    const budgets = await this.prisma.budget.findMany({
      where: { mois: now.getMonth() + 1, annee: now.getFullYear() },
    });

    this.logger.log(`Clôture de journée : ${budgets.length} budget(s) à traiter`);

    for (const budget of budgets) {
      try {
        const bilan = await this.epargneService.calculerEpargneJournaliere(
          budget.userId,
        );

        if (bilan.epargneJour <= 0) continue;

        await this.epargneService.syncEpargneAutomatiqueDuJour(
          budget.userId,
          bilan.epargneJour,
        );

        const debutJour = new Date();
        debutJour.setHours(0, 0, 0, 0);
        await this.notificationsService.createBudgetNotification(
          budget.userId,
          'EPARGNE',
          `Bravo ! Vous avez épargné ${Math.round(bilan.epargneJour)} FCFA aujourd'hui en restant sous votre budget du jour.`,
          debutJour,
        );
      } catch (error) {
        this.logger.error(
          `Échec du bilan de journée pour l'utilisateur ${budget.userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
