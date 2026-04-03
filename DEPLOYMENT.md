# 🚀 Guide de Déploiement - Moni Backend sur Render

## 📋 Prérequis

- [x] Compte Render (https://render.com)
- [x] pgAdmin installé localement
- [x] Git repository configuré
- [x] Backend NestJS fonctionnel

## 🗄️ Configuration PostgreSQL Locale (Développement)

### 1. Créer la base de données avec pgAdmin

1. Ouvrir **pgAdmin**
2. Créer une nouvelle base de données :
   - Nom : `moni_db`
   - Owner : `postgres` (ou votre utilisateur)
   - Encoding : `UTF8`

### 2. Configurer les variables d'environnement

Créer/modifier le fichier `.env` :

```env
# Database
DATABASE_URL="postgresql://postgres:votre_password@localhost:5432/moni_db?schema=public"

# JWT
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=votre-secret-refresh-super-securise
JWT_REFRESH_EXPIRATION=30d

# Server
PORT=3000
NODE_ENV=development

# Email (optionnel pour dev)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe-app
MAIL_FROM=noreply@moni.app

# Twilio (optionnel pour dev)
TWILIO_ACCOUNT_SID=votre-sid
TWILIO_AUTH_TOKEN=votre-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# (Optionnel) Peupler avec des données de test
npm run prisma:seed
```

### 4. Tester localement

```bash
# Démarrer en mode développement
npm run start:dev

# L'API sera disponible sur http://localhost:3000
# Documentation Swagger sur http://localhost:3000/api
```

## ☁️ Déploiement sur Render

### Méthode 1 : Via le Dashboard Render (Recommandé)

#### Étape 1 : Créer la base de données PostgreSQL

1. Aller sur https://dashboard.render.com
2. Cliquer sur **"New +"** → **"PostgreSQL"**
3. Configurer :
   - **Name** : `moni-db`
   - **Database** : `moni_db`
   - **User** : `moni_user`
   - **Region** : Choisir la plus proche (ex: Frankfurt)
   - **Plan** : Free
4. Cliquer sur **"Create Database"**
5. **IMPORTANT** : Copier l'**Internal Database URL** (commence par `postgresql://`)

#### Étape 2 : Déployer l'API Backend

1. Cliquer sur **"New +"** → **"Web Service"**
2. Connecter votre repository Git
3. Configurer :
   - **Name** : `moni-api`
   - **Region** : Même que la DB (Frankfurt)
   - **Branch** : `main` ou `master`
   - **Root Directory** : `moni_back` (si dans un monorepo)
   - **Runtime** : Docker
   - **Plan** : Free

4. **Variables d'environnement** (cliquer sur "Advanced") :
   ```
   DATABASE_URL = [Coller l'Internal Database URL de l'étape 1]
   NODE_ENV = production
   PORT = 3000
   JWT_SECRET = [Générer une clé aléatoire sécurisée]
   JWT_EXPIRATION = 7d
   JWT_REFRESH_SECRET = [Générer une autre clé aléatoire]
   JWT_REFRESH_EXPIRATION = 30d
   ```

5. Cliquer sur **"Create Web Service"**

#### Étape 3 : Vérifier le déploiement

1. Attendre que le build se termine (5-10 minutes)
2. Render va :
   - Build l'image Docker
   - Exécuter les migrations Prisma
   - Démarrer l'application

3. Votre API sera disponible sur : `https://moni-api.onrender.com`
4. Documentation Swagger : `https://moni-api.onrender.com/api`

### Méthode 2 : Via render.yaml (Infrastructure as Code)

1. Le fichier `render.yaml` est déjà configuré
2. Sur Render Dashboard :
   - Cliquer sur **"New +"** → **"Blueprint"**
   - Connecter votre repository
   - Render détectera automatiquement `render.yaml`
   - Cliquer sur **"Apply"**

## 🔧 Configuration Post-Déploiement

### Connecter pgAdmin à la base Render

1. Dans pgAdmin, créer une nouvelle connexion :
   - **Host** : Copier depuis Render Dashboard → Database → External Database URL
   - **Port** : 5432
   - **Database** : moni_db
   - **Username** : moni_user
   - **Password** : Copier depuis Render Dashboard

2. Vous pouvez maintenant gérer votre base de production depuis pgAdmin

### Tester l'API déployée

```bash
# Health check
curl https://moni-api.onrender.com

# Créer un utilisateur (exemple)
curl -X POST https://moni-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+22670000000",
    "password": "Test1234!"
  }'
```

## 📱 Connecter l'App Flutter

Dans votre app Flutter, mettre à jour l'URL de l'API :

```dart
// lib/helpers/services/api_service.dart
class APIService {
  static const String baseURL = 'https://moni-api.onrender.com';
  // ...
}
```

## 🔄 Mises à jour et Redéploiement

### Déploiement automatique

Render redéploie automatiquement à chaque push sur la branche configurée.

```bash
git add .
git commit -m "Update backend"
git push origin main
```

### Déploiement manuel

1. Aller sur Render Dashboard
2. Sélectionner votre service `moni-api`
3. Cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**

## 🐛 Debugging

### Voir les logs

1. Render Dashboard → Service `moni-api`
2. Onglet **"Logs"**
3. Les logs en temps réel s'affichent

### Problèmes courants

#### Build échoue
- Vérifier que `Dockerfile` est à la racine du projet
- Vérifier les dépendances dans `package.json`

#### Migrations échouent
- Vérifier `DATABASE_URL` dans les variables d'environnement
- S'assurer que la DB est créée et accessible

#### L'app ne démarre pas
- Vérifier les logs pour les erreurs
- S'assurer que `PORT=3000` est défini
- Vérifier que toutes les variables d'environnement sont présentes

## 📊 Monitoring

### Métriques Render

- CPU usage
- Memory usage
- Request count
- Response time

Disponibles dans l'onglet **"Metrics"** du service.

## 💰 Limites du Plan Gratuit

- **Database** : 1 GB de stockage, 97 heures/mois
- **Web Service** : 750 heures/mois, se met en veille après 15 min d'inactivité
- **Premier démarrage après veille** : ~30 secondes

### Éviter la mise en veille

Utiliser un service de ping (ex: UptimeRobot) pour garder l'API active.

## 🔐 Sécurité

### Variables sensibles

- ❌ Ne jamais commit `.env` dans Git
- ✅ Utiliser les variables d'environnement Render
- ✅ Générer des secrets forts pour JWT

### CORS

Le backend est configuré pour accepter toutes les origines (`origin: '*'`).
Pour la production, limiter aux domaines autorisés :

```typescript
// src/main.ts
app.enableCors({
  origin: ['https://votre-app.com', 'https://moni-api.onrender.com'],
  credentials: true,
});
```

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Prisma avec PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [NestJS Deployment](https://docs.nestjs.com/deployment)

## ✅ Checklist de Déploiement

- [ ] Base de données PostgreSQL créée sur Render
- [ ] Variables d'environnement configurées
- [ ] Service web déployé avec succès
- [ ] Migrations Prisma exécutées
- [ ] API accessible via l'URL Render
- [ ] Documentation Swagger accessible
- [ ] pgAdmin connecté à la base de production
- [ ] App Flutter configurée avec la nouvelle URL
- [ ] Tests de l'API en production réussis

---

🎉 **Votre backend Moni est maintenant déployé et prêt à l'emploi !**
