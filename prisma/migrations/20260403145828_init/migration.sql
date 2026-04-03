-- CreateEnum
CREATE TYPE "TypeRevenu" AS ENUM ('SALAIRE', 'PRIME', 'FREELANCE', 'INVESTISSEMENT', 'AUTRE');

-- CreateEnum
CREATE TYPE "CategorieDepense" AS ENUM ('ALIMENTATION', 'TRANSPORT', 'LOGEMENT', 'SANTE', 'EDUCATION', 'LOISIRS', 'VETEMENTS', 'COMMUNICATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('BUDGET_10', 'BUDGET_50', 'BUDGET_80', 'BUDGET_100', 'DEPASSE', 'EPARGNE', 'CONSEIL', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeConseil" AS ENUM ('ECONOMIE', 'CATEGORIE', 'EPARGNE', 'BUDGET', 'AUTRE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenus" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "type" "TypeRevenu" NOT NULL DEFAULT 'AUTRE',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depenses" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "categorie" "CategorieDepense" NOT NULL DEFAULT 'AUTRE',
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "montantMensuel" DOUBLE PRECISION NOT NULL,
    "montantJournalier" DOUBLE PRECISION NOT NULL,
    "montantUtilise" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epargnes" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "objectif" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epargnes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL DEFAULT 'AUTRE',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conseils" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "TypeConseil" NOT NULL DEFAULT 'AUTRE',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conseils_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_mois_annee_key" ON "budgets"("userId", "mois", "annee");

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenus" ADD CONSTRAINT "revenus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes" ADD CONSTRAINT "epargnes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conseils" ADD CONSTRAINT "conseils_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
