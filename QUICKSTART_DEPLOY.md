# ⚡ Guide de Démarrage Rapide - Configuration et Déploiement

## 🎯 Étapes Rapides

### 1️⃣ Configuration PostgreSQL Locale avec pgAdmin

#### A. Créer la base de données

1. **Ouvrir pgAdmin**
2. **Clic droit sur "Databases"** → **"Create"** → **"Database"**
3. Remplir :
   - **Database** : `moni_db`
   - **Owner** : `postgres`
   - **Encoding** : `UTF8`
4. Cliquer sur **"Save"**

#### B. Vérifier la connexion

Dans pgAdmin, vous devriez voir `moni_db` dans la liste des bases de données.

### 2️⃣ Configurer le fichier .env

```bash
cd /Users/sahelys/AndroidStudioProjects/solidar/moni/moni_back
```

Créer/modifier le fichier `.env` avec vos informations :

```env
# Remplacer 'votre_password' par votre mot de passe PostgreSQL
DATABASE_URL="postgresql://postgres:votre_password@localhost:5432/moni_db?schema=public"

JWT_SECRET=moni_secret_key_2026_super_secure_change_me
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=moni_refresh_secret_2026_super_secure
JWT_REFRESH_EXPIRATION=30d

PORT=3000
NODE_ENV=development

# Optionnel pour l'instant
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@moni.app

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 3️⃣ Installer et Initialiser

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate

# (Optionnel) Peupler avec des données de test
npm run prisma:seed
```

### 4️⃣ Tester Localement

```bash
# Démarrer le serveur
npm run start:dev
```

Ouvrir dans le navigateur :
- **API** : http://localhost:3000
- **Swagger Documentation** : http://localhost:3000/api

### 5️⃣ Déployer sur Render

#### Option A : Via Dashboard (Plus Simple)

1. **Aller sur** https://dashboard.render.com
2. **Créer un compte** si nécessaire

#### Créer la Base de Données PostgreSQL

1. Cliquer sur **"New +"** → **"PostgreSQL"**
2. Configurer :
   ```
   Name: moni-db
   Database: moni_db
   User: moni_user
   Region: Frankfurt (ou plus proche)
   Plan: Free
   ```
3. Cliquer sur **"Create Database"**
4. **⚠️ IMPORTANT** : Copier l'**Internal Database URL** (commence par `postgresql://`)

#### Créer le Web Service

1. Cliquer sur **"New +"** → **"Web Service"**
2. **Connecter votre repository GitHub/GitLab**
3. Sélectionner le repository `moni`
4. Configurer :
   ```
   Name: moni-api
   Region: Frankfurt (même que la DB)
   Branch: main
   Root Directory: moni_back
   Runtime: Docker
   Plan: Free
   ```

5. **Variables d'environnement** (Section "Environment") :
   
   Cliquer sur **"Add Environment Variable"** pour chaque :
   
   ```
   DATABASE_URL = [Coller l'Internal Database URL copiée précédemment]
   NODE_ENV = production
   PORT = 3000
   JWT_SECRET = moni_prod_secret_2026_change_me_in_production
   JWT_EXPIRATION = 7d
   JWT_REFRESH_SECRET = moni_prod_refresh_2026_change_me
   JWT_REFRESH_EXPIRATION = 30d
   ```

6. Cliquer sur **"Create Web Service"**

7. **Attendre le déploiement** (5-10 minutes)

#### Option B : Via Blueprint (render.yaml)

1. Sur Render Dashboard, cliquer sur **"New +"** → **"Blueprint"**
2. Connecter votre repository
3. Render détectera automatiquement `render.yaml`
4. Cliquer sur **"Apply"**
5. Render créera automatiquement la DB et le service

### 6️⃣ Vérifier le Déploiement

Une fois déployé, votre API sera disponible sur :
```
https://moni-api.onrender.com
```

Documentation Swagger :
```
https://moni-api.onrender.com/api
```

### 7️⃣ Connecter pgAdmin à la Base Render

1. Dans pgAdmin, **clic droit sur "Servers"** → **"Register"** → **"Server"**
2. **Onglet General** :
   - Name : `Moni Production`
3. **Onglet Connection** :
   - Aller sur Render Dashboard → Database `moni-db`
   - Copier les informations :
     - **Hostname** : (depuis External Database URL)
     - **Port** : 5432
     - **Database** : moni_db
     - **Username** : moni_user
     - **Password** : (depuis Render)
4. Cliquer sur **"Save"**

Vous pouvez maintenant gérer votre base de production depuis pgAdmin !

### 8️⃣ Mettre à Jour l'App Flutter

Dans votre app Flutter, mettre à jour l'URL de l'API :

```dart
// lib/helpers/services/api_service.dart
class APIService {
  // Changer de localhost vers l'URL Render
  static const String baseURL = 'https://moni-api.onrender.com';
  
  // ... reste du code
}
```

## 🧪 Tester l'API

### Test Local

```bash
# Health check
curl http://localhost:3000

# Créer un utilisateur
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+22670000000",
    "password": "Test1234!"
  }'
```

### Test Production

```bash
# Health check
curl https://moni-api.onrender.com

# Créer un utilisateur
curl -X POST https://moni-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+22670000001",
    "password": "Test1234!"
  }'
```

## 🔄 Redéployer après Modifications

```bash
# Faire vos modifications
git add .
git commit -m "Update backend"
git push origin main

# Render redéploie automatiquement !
```

## 🐛 Problèmes Courants

### Erreur de connexion à PostgreSQL local

```bash
# Vérifier que PostgreSQL est démarré
# Sur Mac avec Homebrew :
brew services list
brew services start postgresql

# Vérifier le mot de passe dans .env
```

### Build échoue sur Render

- Vérifier que `Dockerfile` est à la racine de `moni_back`
- Vérifier les logs dans Render Dashboard → Service → Logs

### Migrations échouent

```bash
# Localement, réinitialiser la DB si nécessaire
npm run prisma:migrate reset
npm run prisma:migrate

# Sur Render, vérifier DATABASE_URL dans les variables d'environnement
```

## 📊 Commandes Utiles

```bash
# Voir les tables créées
npm run prisma:studio

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Réinitialiser la DB (⚠️ supprime toutes les données)
npx prisma migrate reset

# Voir les logs en temps réel (local)
npm run start:dev

# Build pour production
npm run build
npm run start:prod
```

## ✅ Checklist

- [ ] pgAdmin installé et PostgreSQL démarré
- [ ] Base de données `moni_db` créée dans pgAdmin
- [ ] Fichier `.env` configuré avec le bon mot de passe
- [ ] `npm install` exécuté
- [ ] `npm run prisma:generate` exécuté
- [ ] `npm run prisma:migrate` exécuté
- [ ] API démarre localement sur http://localhost:3000
- [ ] Swagger accessible sur http://localhost:3000/api
- [ ] Compte Render créé
- [ ] Base de données PostgreSQL créée sur Render
- [ ] Web Service déployé sur Render
- [ ] Variables d'environnement configurées sur Render
- [ ] API accessible sur https://moni-api.onrender.com
- [ ] pgAdmin connecté à la base de production
- [ ] App Flutter mise à jour avec l'URL de production

## 🎉 Félicitations !

Votre backend Moni est maintenant configuré localement et déployé en production sur Render !

---

**Besoin d'aide ?** Consultez le fichier `DEPLOYMENT.md` pour plus de détails.
