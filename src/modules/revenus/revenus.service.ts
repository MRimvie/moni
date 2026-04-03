import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRevenuDto } from './dto/create-revenu.dto';

@Injectable()
export class RevenusService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRevenuDto) {
    return this.prisma.revenu.create({
      data: {
        ...dto,
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findAll(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.revenu.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getTotalRevenu(userId: string, mois: number, annee: number) {
    const startDate = new Date(annee, mois - 1, 1);
    const endDate = new Date(annee, mois, 0, 23, 59, 59);

    const revenus = await this.prisma.revenu.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return revenus.reduce((sum, revenu) => sum + revenu.montant, 0);
  }
}
