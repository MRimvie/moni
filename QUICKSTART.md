# 🚀 Guide de Démarrage Rapide - Moni Backend

## Installation en 5 minutes

### 1. Installation des dépendances

```bash
cd moni_back
npm install
```

### 2. Configuration de la base de données

Créer un fichier `.env` :

```bash
cp .env.example .env
```

Modifier la ligne `DATABASE_URL` dans `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/moni_db?schema=public"
```

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et appliquer les migrations
npm run prisma:migrate

# Remplir avec des données de test
npm run prisma:seed
```

### 4. Lancer l'application

```bash
npm run start:dev
```

✅ **L'API est maintenant disponible sur http://localhost:3000**

📚 **Documentation Swagger : http://localhost:3000/api**

---

## 🧪 Tester l'API

### Compte de test créé par le seed

- **Email** : `john@example.com`
- **Mot de passe** : `password123`

### Exemple de requête

#### 1. Se connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Vous recevrez un token JWT dans la réponse.

#### 2. Obtenir le profil utilisateur

```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### 3. Créer une dépense

```bash
curl -X POST http://localhost:3000/depenses \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "montant": 5000,
    "categorie": "ALIMENTATION",
    "description": "Courses du marché"
  }'
```

---

## 📊 Endpoints Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| GET | `/users/me` | Profil utilisateur |
| POST | `/revenus` | Créer un revenu |
| GET | `/revenus` | Liste des revenus |
| POST | `/depenses` | Créer une dépense |
| GET | `/depenses` | Liste des dépenses |
| POST | `/budgets` | Créer un budget |
| GET | `/budgets` | Liste des budgets |
| GET | `/epargne` | Liste des épargnes |
| GET | `/notifications` | Notifications |
| GET | `/conseils` | Conseils financiers |

---

## 🛠️ Commandes Utiles

```bash
# Démarrer en mode développement
npm run start:dev

# Voir la base de données (interface graphique)
npm run prisma:studio

# Réinitialiser la base de données
npx prisma migrate reset

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration
```

---

## ❓ Problèmes Courants

### Erreur de connexion à PostgreSQL

Assurez-vous que PostgreSQL est démarré :

```bash
# macOS avec Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Démarrer PostgreSQL depuis les services
```

### Port 3000 déjà utilisé

Modifier le port dans `.env` :

```env
PORT=3001
```

### Erreur Prisma

Régénérer le client Prisma :

```bash
npm run prisma:generate
```

---

## 📖 Documentation Complète

Pour plus de détails, consultez le [README.md](./README.md)

---

**Bon développement ! 🎉**
