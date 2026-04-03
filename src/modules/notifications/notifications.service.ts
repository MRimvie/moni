import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TypeNotification } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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

  async createBudgetNotification(userId: string, type: string, message: string) {
    const existingNotif = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: type as TypeNotification,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingNotif) {
      return existingNotif;
    }

    return this.prisma.notification.create({
      data: {
        message,
        type: type as TypeNotification,
        userId,
      },
    });
  }

  async createNotification(userId: string, type: TypeNotification, message: string) {
    return this.prisma.notification.create({
      data: {
        message,
        type,
        userId,
      },
    });
  }
}
