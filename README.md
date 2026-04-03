# 💰 Moni Backend - API de Gestion de Budget Intelligent

Backend NestJS professionnel pour application mobile de gestion de budget personnel.

## 🚀 Technologies

- **Backend**: NestJS (TypeScript)
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Auth**: JWT + OTP
- **Validation**: class-validator
- **Documentation**: Swagger

## 📋 Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

## ⚙️ Installation

### 1. Cloner et installer les dépendances

```bash
cd moni_back
npm install
```

### 2. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos configurations :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/moni_db?schema=public"

JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRATION=7d

PORT=3000
NODE_ENV=development

# Email (optionnel)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe-app

# Twilio pour SMS (optionnel)
TWILIO_ACCOUNT_SID=votre-account-sid
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Configuration de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer et appliquer les migrations
npm run prisma:migrate

# (Optionnel) Remplir la base avec des données de test
npm run prisma:seed
```

### 4. Lancer l'application

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000`

Documentation Swagger : `http://localhost:3000/api`

## 📁 Structure du Projet

```
src/
├── modules/
│   ├── auth/              # Authentification JWT + OTP
│   ├── users/             # Gestion utilisateurs
│   ├── revenus/           # Gestion des revenus
│   ├── depenses/          # Gestion des dépenses
│   ├── budgets/           # Gestion des budgets
│   ├── epargne/           # Gestion de l'épargne
│   ├── notifications/     # Notifications intelligentes
│   └── conseils/          # Conseils financiers
│
├── common/
│   ├── guards/            # Guards JWT
│   ├── decorators/        # Decorators personnalisés
│   ├── filters/           # Filtres d'exception
│   └── interceptors/      # Interceptors (logging, transform)
│
├── prisma/                # Service Prisma
├── config/                # Configuration
├── main.ts                # Point d'entrée
└── app.module.ts          # Module principal
```

## 🔐 Authentification

### Inscription

```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Connexion

```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### OTP

```bash
# Envoyer un code OTP
POST /auth/otp/send
{
  "email": "john@example.com"
}

# Vérifier le code OTP
POST /auth/otp/verify
{
  "email": "john@example.com",
  "code": "123456"
}
```

## 📊 Endpoints Principaux

### Revenus

- `POST /revenus` - Créer un revenu
- `GET /revenus` - Liste des revenus (avec filtres date)

### Dépenses

- `POST /depenses` - Créer une dépense
- `GET /depenses` - Liste des dépenses (avec filtres date/catégorie)

### Budgets

- `POST /budgets` - Créer un budget
- `GET /budgets` - Liste des budgets

### Épargne

- `GET /epargne` - Liste des épargnes
- `GET /epargne/total` - Total épargné

### Notifications

- `GET /notifications` - Liste des notifications
- `PATCH /notifications/:id/read` - Marquer comme lue
- `PATCH /notifications/read-all` - Tout marquer comme lu

### Conseils

- `GET /conseils` - Conseils financiers personnalisés

## 🧠 Logique Métier

### Budget Journalier Automatique

```
budgetJournalier = budgetMensuel / joursRestantsDansMois
```

### Épargne Automatique

Si `dépenseJournalière < budgetJournalier` :
- Le reste est automatiquement ajouté à l'épargne

### Notifications Intelligentes

Déclenchées automatiquement à :
- 10% du budget utilisé
- 50% du budget utilisé
- 80% du budget utilisé
- 100% du budget utilisé

### Conseils Automatiques

Générés selon :
- Catégories de dépenses dominantes
- Comportement d'épargne
- Respect du budget

## 🛠️ Commandes Utiles

```bash
# Lancer les tests
npm run test

# Lancer les tests e2e
npm run test:e2e

# Linter le code
npm run lint

# Formater le code
npm run format

# Ouvrir Prisma Studio (interface graphique DB)
npm run prisma:studio

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration
```

## 📦 Scripts NPM

- `npm run start` - Démarrer l'application
- `npm run start:dev` - Mode développement avec hot-reload
- `npm run start:prod` - Mode production
- `npm run build` - Compiler le projet
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Appliquer les migrations
- `npm run prisma:seed` - Remplir la base de données
- `npm run prisma:studio` - Interface graphique Prisma

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- JWT pour l'authentification
- Validation des entrées avec class-validator
- Protection CORS configurée
- Guards sur toutes les routes protégées

## 📖 Documentation API

Une fois l'application lancée, accédez à la documentation Swagger complète :

👉 **http://localhost:3000/api**

La documentation inclut :
- Tous les endpoints disponibles
- Schémas de requêtes/réponses
- Exemples de données
- Possibilité de tester directement les endpoints

## 🐛 Débogage

Pour activer les logs détaillés :

```bash
# Mode debug
npm run start:debug
```

## 📝 Notes Importantes

1. **Base de données** : Assurez-vous que PostgreSQL est démarré avant de lancer l'application
2. **Migrations** : Toujours exécuter les migrations après un pull
3. **Variables d'environnement** : Ne jamais commiter le fichier `.env`
4. **OTP** : Les codes OTP sont actuellement loggés en console (à remplacer par un vrai service email/SMS en production)

## 🚀 Déploiement

### Production

1. Configurer les variables d'environnement de production
2. Compiler le projet : `npm run build`
3. Lancer : `npm run start:prod`

### Docker (optionnel)

```dockerfile
# Créer un Dockerfile si nécessaire
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Développé avec ❤️ pour Moni**
# moni
