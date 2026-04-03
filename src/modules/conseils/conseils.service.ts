import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TypeConseil } from '@prisma/client';

@Injectable()
export class ConseilsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.conseil.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async genererConseilsAutomatiques(userId: string) {
    const now = new Date();
    const mois = now.getMonth() + 1;
    const annee = now.getFullYear();

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
    let totalDepenses = 0;

    depenses.forEach((depense) => {
      if (!byCategorie[depense.categorie]) {
        byCategorie[depense.categorie] = 0;
      }
      byCategorie[depense.categorie] += depense.montant;
      totalDepenses += depense.montant;
    });

    const categorieDominante = Object.entries(byCategorie).sort((a, b) => b[1] - a[1])[0];

    if (categorieDominante) {
      const [categorie, montant] = categorieDominante;
      const pourcentage = (montant / totalDepenses) * 100;

      if (pourcentage > 40) {
        const conseilExistant = await this.prisma.conseil.findFirst({
          where: {
            userId,
            type: TypeConseil.CATEGORIE,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        });

        if (!conseilExistant) {
          await this.creerConseil(
            userId,
            TypeConseil.CATEGORIE,
            `Attention! ${pourcentage.toFixed(0)}% de vos dépenses sont dans la catégorie ${categorie}. Pensez à diversifier vos dépenses.`,
          );
        }
      }
    }

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_mois_annee: {
          userId,
          mois,
          annee,
        },
      },
    });

    if (budget && budget.montantUtilise < budget.montantMensuel * 0.8) {
      const conseilEpargne = await this.prisma.conseil.findFirst({
        where: {
          userId,
          type: TypeConseil.EPARGNE,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!conseilEpargne) {
        await this.creerConseil(
          userId,
          TypeConseil.EPARGNE,
          'Bravo! Vous gérez bien votre budget. Continuez à épargner le reste.',
        );
      }
    }
  }

  async creerConseil(userId: string, type: TypeConseil, message: string) {
    return this.prisma.conseil.create({
      data: {
        message,
        type,
        userId,
      },
    });
  }
}
