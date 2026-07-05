import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TypeNotification } from '@prisma/client';
import { FcmService } from '../fcm/fcm.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private fcmService: FcmService,
  ) {}

  async findAll(userId: string, isRead?: boolean) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Crée une notification (BDD + push FCM) avec déduplication par type :
   * aucune nouvelle notification du même type n'est envoyée si une existe
   * déjà depuis `dedupSince` (par défaut : les dernières 24h).
   */
  async createBudgetNotification(
    userId: string,
    type: string,
    message: string,
    dedupSince?: Date,
  ) {
    const existingNotif = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: type as TypeNotification,
        createdAt: {
          gte: dedupSince ?? new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingNotif) {
      return existingNotif;
    }

    const notification = await this.prisma.notification.create({
      data: {
        message,
        type: type as TypeNotification,
        userId,
      },
    });

    // Envoyer la notification push
    try {
      await this.fcmService.sendNotificationToUser(
        userId,
        this.getNotificationTitle(type as TypeNotification),
        message,
        { 
          notificationId: notification.id,
          type: type,
        },
      );
    } catch (error) {
      console.error('Erreur envoi push notification:', error);
    }

    return notification;
  }

  private getNotificationTitle(type: TypeNotification): string {
    switch (type) {
      case 'BUDGET_10':
        return 'Budget Moni';
      case 'BUDGET_50':
        return 'Budget à 50%';
      case 'BUDGET_80':
        return 'Attention Budget';
      case 'BUDGET_100':
        return 'Budget mensuel dépassé';
      case 'DEPASSE':
        return 'Budget du jour dépassé';
      case 'EPARGNE':
        return 'Épargne';
      case 'CONSEIL':
        return 'Conseil financier';
      default:
        return 'Moni';
    }
  }

  async createNotification(userId: string, type: TypeNotification, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        message,
        type,
        userId,
      },
    });

    // Envoyer la notification push
    try {
      await this.fcmService.sendNotificationToUser(
        userId,
        this.getNotificationTitle(type),
        message,
        { 
          notificationId: notification.id,
          type: type,
        },
      );
    } catch (error) {
      console.error('Erreur envoi push notification:', error);
    }

    return notification;
  }
}
