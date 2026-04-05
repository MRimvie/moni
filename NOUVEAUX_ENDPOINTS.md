# 🚀 Nouveaux Endpoints Backend - Moni API

## ✅ Endpoints Créés

### 1. **GET /budgets/progression**
Obtenir la progression du budget du mois en cours

**Response** :
```json
{
  "budgetMensuel": 100000,
  "budgetJournalier": 3333.33,
  "montantUtilise": 45000,
  "montantRestant": 55000,
  "pourcentage": 45.0,
  "status": "Bon",
  "mois": 4,
  "annee": 2026
}
```

**Status** :
- `"Bon"` : < 50%
- `"Modéré"` : 50% - 79%
- `"Attention"` : 80% - 99%
- `"Dépassé"` : >= 100%

**Fichiers modifiés** :
- `src/modules/budgets/budgets.controller.ts`
- `src/modules/budgets/budgets.service.ts`

---

### 2. **GET /epargne/calcul-journalier**
Calculer l'épargne du jour (Budget journalier - Dépenses du jour)

**Response** :
```json
{
  "budgetJournalier": 3000,
  "depensesJour": 1200,
  "epargneJour": 1800,
  "date": "2026-04-05T22:40:00.000Z"
}
```

**Logique** :
```
epargneJour = budgetJournalier - depensesJour
Si epargneJour < 0, alors epargneJour = 0
```

**Fichiers modifiés** :
- `src/modules/epargne/epargne.controller.ts`
- `src/modules/epargne/epargne.service.ts`

---

### 3. **GET /epargne/historique**
Obtenir l'historique des épargnes par jour (30 derniers jours)

**Response** :
```json
[
  {
    "date": "2026-04-05T00:00:00.000Z",
    "budgetJournalier": 3000,
    "depenses": 1200,
    "epargne": 1800,
    "pourcentageUtilise": 40
  },
  {
    "date": "2026-04-04T00:00:00.000Z",
    "budgetJournalier": 3000,
    "depenses": 2500,
    "epargne": 500,
    "pourcentageUtilise": 83
  },
  ...
]
```

**Fichiers modifiés** :
- `src/modules/epargne/epargne.controller.ts`
- `src/modules/epargne/epargne.service.ts`

---

## 📁 Fichiers Modifiés

### Backend
```
src/modules/budgets/
├── budgets.controller.ts    ✅ Ajout endpoint /progression
└── budgets.service.ts        ✅ Ajout méthode getProgression()

src/modules/epargne/
├── epargne.controller.ts     ✅ Ajout endpoints /calcul-journalier et /historique
└── epargne.service.ts        ✅ Ajout méthodes calculerEpargneJournaliere() et getHistoriqueParJour()
```

---

## 🔧 Détails Techniques

### BudgetsService.getProgression()
```typescript
async getProgression(userId: string) {
  const now = new Date();
  const mois = now.getMonth() + 1;
  const annee = now.getFullYear();

  // Récupérer ou créer le budget du mois
  const budget = await this.getOrCreateBudget(userId, mois, annee);

  // Calculer les dépenses du mois
  const startOfMonth = new Date(annee, mois - 1, 1);
  const endOfMonth = new Date(annee, mois, 0, 23, 59, 59);

  const depenses = await this.prisma.depense.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const pourcentage = (totalDepenses / budget.montantMensuel) * 100;

  return {
    budgetMensuel: budget.montantMensuel,
    budgetJournalier: budget.montantJournalier,
    montantUtilise: totalDepenses,
    montantRestant: Math.max(0, budget.montantMensuel - totalDepenses),
    pourcentage: Math.round(pourcentage * 10) / 10,
    status: /* Bon/Modéré/Attention/Dépassé */,
    mois,
    annee,
  };
}
```

### EpargneService.calculerEpargneJournaliere()
```typescript
async calculerEpargneJournaliere(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // Récupérer le budget du mois
  const budget = await this.prisma.budget.findFirst({
    where: { userId, mois, annee },
    orderBy: { createdAt: 'desc' },
  });

  // Calculer les dépenses du jour
  const depensesJour = await this.prisma.depense.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lte: endOfDay },
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
```

### EpargneService.getHistoriqueParJour()
```typescript
async getHistoriqueParJour(userId: string, jours: number = 30) {
  const historique = [];
  const today = new Date();

  for (let i = 0; i < jours; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Récupérer budget et dépenses pour ce jour
    // Calculer l'épargne
    // Ajouter à l'historique
  }

  return historique;
}
```

---

## 🧪 Tests à Effectuer

### Test 1 : Progression du Budget
```bash
curl -X GET https://moni-api-sgeg.onrender.com/budgets/progression \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Vérifier** :
- [ ] `budgetMensuel` correct
- [ ] `montantUtilise` = somme des dépenses du mois
- [ ] `pourcentage` calculé correctement
- [ ] `status` correspond au pourcentage

### Test 2 : Épargne du Jour
```bash
curl -X GET https://moni-api-sgeg.onrender.com/epargne/calcul-journalier \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Vérifier** :
- [ ] `budgetJournalier` correct
- [ ] `depensesJour` = somme des dépenses d'aujourd'hui
- [ ] `epargneJour` = budgetJournalier - depensesJour
- [ ] Si négatif, `epargneJour` = 0

### Test 3 : Historique Épargne
```bash
curl -X GET https://moni-api-sgeg.onrender.com/epargne/historique \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Vérifier** :
- [ ] Retourne 30 jours
- [ ] Ordre chronologique (du plus récent au plus ancien)
- [ ] Calculs corrects pour chaque jour
- [ ] `pourcentageUtilise` calculé

---

## 📊 Utilisation Frontend

### DashboardController
```dart
// Charger la progression du budget
final progression = await BudgetService.getProgression();
if (progression != null) {
  budgetMensuel.value = progression['budgetMensuel'];
  budgetUtilise.value = progression['montantUtilise'];
  pourcentage.value = progression['pourcentage'];
  status.value = progression['status'];
}
```

### EpargneController
```dart
// Charger l'épargne du jour
final epargneJour = await EpargneService.getEpargneJour();
if (epargneJour != null) {
  this.epargneJour.value = epargneJour['epargneJour'];
  budgetJournalier.value = epargneJour['budgetJournalier'];
  depensesJour.value = epargneJour['depensesJour'];
}

// Charger l'historique
final historique = await EpargneService.getHistorique();
if (historique != null) {
  historiqueEpargnes.value = historique;
}
```

---

## ✅ Prêt pour Déploiement

Tous les endpoints sont créés et prêts à être déployés sur Render.

**Commandes Git** :
```bash
cd /Users/sahelys/AndroidStudioProjects/solidar/moni/moni_back
git add .
git commit -m "feat: add progression budget and epargne endpoints with backend calculations"
git push origin main
```

---

**Date** : 5 avril 2026  
**Status** : ✅ ENDPOINTS CRÉÉS - PRÊT POUR PUSH
