# 🚀 Configuration Production - Moni API

## ✅ Déploiement Réussi

Votre API Moni est maintenant déployée sur Render !

### 📍 Informations de Production

**Base de données PostgreSQL :**
```
Host: dpg-d77tdms50q8c73d28pbg-a.frankfurt-postgres.render.com
Database: moni_db_wxyz
User: moni_user
```

**URL de l'API :** Vérifiez sur Render Dashboard → Service `moni-api` → URL

---

## 👤 Créer un Compte Utilisateur par Défaut

### Option 1 : Via l'API (Recommandé)

Utilisez l'endpoint `/auth/register` pour créer un utilisateur :

```bash
# Remplacer YOUR_RENDER_URL par l'URL de votre API
curl -X POST https://YOUR_RENDER_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Moni",
    "email": "admin@moni.app",
    "phone": "+22670000000",
    "password": "Admin123!"
  }'
```

**Credentials de test :**
- **Email** : `admin@moni.app`
- **Téléphone** : `+22670000000`
- **Mot de passe** : `Admin123!`

### Option 2 : Via psql

```bash
# Se connecter à la base de données
psql "postgresql://moni_user:2LFqOyGLakY1J2yWl0zlagX8rIselxlX@dpg-d77tdms50q8c73d28pbg-a.frankfurt-postgres.render.com/moni_db_wxyz"

# Vérifier les tables
\dt

# Voir les utilisateurs existants
SELECT id, name, email, phone, "createdAt" FROM users;
```

---

## 🧪 Tester l'API en Production

### 1. Health Check

```bash
curl https://YOUR_RENDER_URL
```

### 2. Documentation Swagger

Ouvrir dans le navigateur :
```
https://YOUR_RENDER_URL/api
```

### 3. Créer un utilisateur

```bash
curl -X POST https://YOUR_RENDER_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+22670000001",
    "password": "Test1234!"
  }'
```

### 4. Se connecter

```bash
curl -X POST https://YOUR_RENDER_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Vous recevrez un `access_token` à utiliser pour les requêtes authentifiées.

### 5. Tester une route protégée

```bash
# Remplacer YOUR_ACCESS_TOKEN par le token reçu
curl -X GET https://YOUR_RENDER_URL/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📱 Connecter l'App Flutter

### Mettre à jour l'URL de l'API

Dans votre app Flutter, modifiez le fichier de configuration de l'API :

```dart
// lib/helpers/services/api_service.dart ou équivalent
class APIService {
  static const String baseURL = 'https://YOUR_RENDER_URL';
  
  // ... reste du code
}
```

### Tester depuis l'app Flutter

1. Lancez l'app Flutter
2. Essayez de vous inscrire avec un nouveau compte
3. Connectez-vous avec les credentials
4. Testez les fonctionnalités (budget, dépenses, revenus, etc.)

---

## 🗄️ Gérer la Base de Données avec pgAdmin

### Ajouter une nouvelle connexion

1. Ouvrir **pgAdmin**
2. **Clic droit sur "Servers"** → **"Register"** → **"Server"**
3. **Onglet General** :
   - Name : `Moni Production (Render)`
4. **Onglet Connection** :
   - Hostname : `dpg-d77tdms50q8c73d28pbg-a.frankfurt-postgres.render.com`
   - Port : `5432`
   - Database : `moni_db_wxyz`
   - Username : `moni_user`
   - Password : `2LFqOyGLakY1J2yWl0zlagX8rIselxlX`
5. Cliquer sur **"Save"**

Vous pouvez maintenant gérer votre base de production depuis pgAdmin !

---

## 🔐 Sécurité - À Faire

### Variables d'environnement sensibles

Sur Render Dashboard → Service → Environment :

1. **JWT_SECRET** : Générer une clé forte (32+ caractères aléatoires)
   ```bash
   # Générer une clé sécurisée
   openssl rand -base64 32
   ```

2. **JWT_REFRESH_SECRET** : Générer une autre clé différente
   ```bash
   openssl rand -base64 32
   ```

3. Redémarrer le service après modification

### Recommandations

- ✅ Ne jamais commiter les fichiers `.env` sur Git
- ✅ Utiliser des mots de passe forts pour les comptes admin
- ✅ Activer HTTPS (déjà fait par Render)
- ✅ Surveiller les logs régulièrement
- ✅ Faire des backups de la base de données

---

## 📊 Monitoring

### Logs en temps réel

Sur Render Dashboard → Service `moni-api` → **Logs**

### Métriques

Sur Render Dashboard → Service `moni-api` → **Metrics**
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔄 Redéployer après Modifications

```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push origin main

# Render redéploie automatiquement !
```

---

## 🆘 Dépannage

### L'API ne répond pas

1. Vérifier les logs sur Render
2. Vérifier que le service est "Live" (pas "Suspended")
3. Vérifier les variables d'environnement

### Erreur de connexion à la base

1. Vérifier `DATABASE_URL` dans les variables d'environnement
2. Vérifier que la base de données est "Available"
3. Tester la connexion avec psql

### Migrations échouent

```bash
# Se connecter au service via SSH (si disponible) ou via psql
psql "postgresql://..."

# Vérifier l'état des migrations
SELECT * FROM _prisma_migrations;

# Réinitialiser si nécessaire (⚠️ ATTENTION : supprime les données)
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;
```

---

## 📞 Support

- **Documentation Render** : https://render.com/docs
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation NestJS** : https://docs.nestjs.com

---

**🎉 Félicitations ! Votre backend Moni est maintenant en production !**
