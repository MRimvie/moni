import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Utilisateur créé:', user1.name);

  const revenu1 = await prisma.revenu.create({
    data: {
      montant: 500000,
      type: 'SALAIRE',
      description: 'Salaire du mois',
      userId: user1.id,
      recurrent: true,
    },
  });

  console.log('✅ Revenu créé:', revenu1.montant);

  const budget1 = await prisma.budget.create({
    data: {
      montantMensuel: 300000,
      montantJournalier: 10000,
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
      userId: user1.id,
    },
  });

  console.log('✅ Budget créé:', budget1.montantMensuel);

  const depense1 = await prisma.depense.create({
    data: {
      montant: 5000,
      categorie: 'ALIMENTATION',
      description: 'Courses du marché',
      userId: user1.id,
    },
  });

  const depense2 = await prisma.depense.create({
    data: {
      montant: 3000,
      categorie: 'TRANSPORT',
      description: 'Taxi',
      userId: user1.id,
    },
  });

  console.log('✅ Dépenses créées:', depense1.montant, depense2.montant);

  const epargne1 = await prisma.epargne.create({
    data: {
      montant: 50000,
      objectif: 'Épargne de sécurité',
      userId: user1.id,
    },
  });

  console.log('✅ Épargne créée:', epargne1.montant);

  const notification1 = await prisma.notification.create({
    data: {
      message: 'Bienvenue sur Moni!',
      type: 'AUTRE',
      userId: user1.id,
    },
  });

  console.log('✅ Notification créée');

  const conseil1 = await prisma.conseil.create({
    data: {
      message: 'Pensez à épargner au moins 20% de vos revenus chaque mois.',
      type: 'EPARGNE',
      userId: user1.id,
    },
  });

  console.log('✅ Conseil créé');

  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
