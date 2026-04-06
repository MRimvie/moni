import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getChartData(userId: string, period: string) {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' | 'month';

    // Déterminer la période et le groupement
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'week';
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
    }

    // Récupérer les dépenses
    const depenses = await this.prisma.depense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Récupérer les épargnes
    const epargnes = await this.prisma.epargne.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Grouper les données par période
    const chartData = this.groupDataByPeriod(depenses, epargnes, startDate, now, groupBy);

    return {
      period,
      groupBy,
      data: chartData,
    };
  }

  private groupDataByPeriod(
    depenses: any[],
    epargnes: any[],
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month',
  ) {
    const dataMap = new Map<string, { date: string; depenses: number; epargnes: number }>();

    // Fonction pour obtenir la clé de groupement
    const getGroupKey = (date: Date): string => {
      if (groupBy === 'day') {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    };

    // Initialiser toutes les périodes avec 0
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = getGroupKey(currentDate);
      if (!dataMap.has(key)) {
        dataMap.set(key, { date: key, depenses: 0, epargnes: 0 });
      }
      
      if (groupBy === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (groupBy === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Ajouter les dépenses
    depenses.forEach((depense) => {
      const key = getGroupKey(new Date(depense.date));
      if (dataMap.has(key)) {
        dataMap.get(key)!.depenses += depense.montant;
      }
    });

    // Ajouter les épargnes
    epargnes.forEach((epargne) => {
      const key = getGroupKey(new Date(epargne.date));
      if (dataMap.has(key)) {
        dataMap.get(key)!.epargnes += epargne.montant;
      }
    });

    // Convertir en tableau et arrondir les valeurs
    return Array.from(dataMap.values()).map(item => ({
      date: item.date,
      depenses: Math.round(item.depenses * 100) / 100,
      epargnes: Math.round(item.epargnes * 100) / 100,
    }));
  }

  async getSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total dépenses du mois
    const depensesMois = await this.prisma.depense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
    });
    const totalDepenses = depensesMois.reduce((sum, d) => sum + d.montant, 0);

    // Total épargnes du mois
    const epargnesMois = await this.prisma.epargne.findMany({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
    });
    const totalEpargnes = epargnesMois.reduce((sum, e) => sum + e.montant, 0);

    // Budget du mois
    const budget = await this.prisma.budget.findFirst({
      where: {
        userId,
        mois: now.getMonth() + 1,
        annee: now.getFullYear(),
      },
    });

    return {
      totalDepenses: Math.round(totalDepenses * 100) / 100,
      totalEpargnes: Math.round(totalEpargnes * 100) / 100,
      budgetMensuel: budget?.montantMensuel || 0,
      budgetJournalier: budget?.montantJournalier || 0,
    };
  }
}
