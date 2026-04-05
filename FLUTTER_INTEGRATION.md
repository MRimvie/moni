# 📱 Intégration Flutter - Backend Moni

## ✅ Configuration Complète

L'intégration entre le backend NestJS déployé sur Render et l'application Flutter est maintenant configurée.

---

## 🔗 URLs Configurées

### Backend Render
- **Base API** : `https://moni-api-sgeg.onrender.com`
- **Base URL** : `https://moni-api-sgeg.onrender.com/api`
- **Swagger Documentation** : `https://moni-api-sgeg.onrender.com/api`

### Configuration Flutter
Fichier : `lib/helpers/constant/app_constant.dart`

```dart
class AppConstant {
  static const String baseAPI = 'https://moni-api-sgeg.onrender.com';
  static const String baseURL = '$baseAPI/api';
}
```

---

## 📁 Services API Créés

Tous les services sont dans : `lib/helpers/services/api/`

### 1. AuthAPIService (`auth_service.dart`)

```dart
import 'package:moni/helpers/services/api/api_services.dart';

// Inscription
final response = await AuthAPIService.register(
  name: "John Doe",
  email: "john@example.com",
  phone: "+22670000000",
  password: "Password123!",
);

// Connexion avec email
final loginResponse = await AuthAPIService.login(
  email: "john@example.com",
  password: "Password123!",
);

// Connexion avec téléphone
final loginResponse = await AuthAPIService.login(
  phone: "+22670000000",
  password: "Password123!",
);

// Envoyer OTP
await AuthAPIService.sendOtp(phone: "+22670000000");

// Vérifier OTP
await AuthAPIService.verifyOtp(
  phone: "+22670000000",
  code: "123456",
);
```

### 2. BudgetService (`budget_service.dart`)

```dart
// Créer un budget
final response = await BudgetService.createBudget(
  montant: 500000.0,
  mois: "2026-04",
);

// Obtenir tous les budgets
final budgets = await BudgetService.getAllBudgets();
```

### 3. DepenseService (`depense_service.dart`)

```dart
// Créer une dépense
final response = await DepenseService.createDepense(
  montant: 5000.0,
  categorie: "ALIMENTATION",
  description: "Courses du mois",
  date: "2026-04-03T00:00:00Z",
);

// Obtenir toutes les dépenses
final depenses = await DepenseService.getAllDepenses();

// Filtrer par date et catégorie
final filtered = await DepenseService.getAllDepenses(
  startDate: "2026-04-01",
  endDate: "2026-04-30",
  categorie: "ALIMENTATION",
);
```

**Catégories disponibles :**
- `ALIMENTATION`
- `TRANSPORT`
- `LOGEMENT`
- `SANTE`
- `EDUCATION`
- `LOISIRS`
- `AUTRE`

### 4. RevenuService (`revenu_service.dart`)

```dart
// Créer un revenu
final response = await RevenuService.createRevenu(
  montant: 100000.0,
  type: "SALAIRE",
  source: "Entreprise XYZ",
  date: "2026-04-01T00:00:00Z",
);

// Obtenir tous les revenus
final revenus = await RevenuService.getAllRevenus();

// Filtrer par période
final filtered = await RevenuService.getAllRevenus(
  startDate: "2026-04-01",
  endDate: "2026-04-30",
);
```

**Types disponibles :**
- `SALAIRE`
- `FREELANCE`
- `INVESTISSEMENT`
- `AUTRE`

### 5. EpargneService (`epargne_service.dart`)

```dart
// Obtenir toutes les épargnes
final epargnes = await EpargneService.getAllEpargnes();

// Obtenir le total épargné
final total = await EpargneService.getTotalEpargne();
// Retourne: { "total": 50000.0 }
```

### 6. NotificationService (`notification_service.dart`)

```dart
// Obtenir toutes les notifications
final notifications = await NotificationService.getAllNotifications();

// Filtrer les non lues
final unread = await NotificationService.getAllNotifications(isRead: false);

// Marquer une notification comme lue
await NotificationService.markAsRead("notification-id");

// Marquer toutes comme lues
await NotificationService.markAllAsRead();
```

### 7. ConseilService (`conseil_service.dart`)

```dart
// Obtenir tous les conseils financiers
final conseils = await ConseilService.getAllConseils();
```

### 8. UserService (`user_service.dart`)

```dart
// Obtenir le profil utilisateur connecté
final profile = await UserService.getProfile();
```

---

## 🎯 Utilisation dans les Controllers GetX

### Exemple : AuthController

```dart
import 'package:get/get.dart';
import 'package:moni/helpers/services/api/api_services.dart';
import 'package:moni/helpers/storage/local_storage.dart';

class AuthController extends GetxController {
  final isLoading = false.obs;
  
  Future<void> login(String email, String password) async {
    try {
      isLoading.value = true;
      
      final response = await AuthAPIService.login(
        email: email,
        password: password,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        // Sauvegarder le token
        final token = response.data!['access_token'];
        await LocalStorage.setAuthToken(token);
        
        // Sauvegarder les infos utilisateur
        final user = response.data!['user'];
        await LocalStorage.setUserData(user);
        
        // Naviguer vers le dashboard
        Get.offAllNamed('/dashboard');
      }
    } catch (e) {
      Get.snackbar('Erreur', 'Connexion échouée: $e');
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    try {
      isLoading.value = true;
      
      final response = await AuthAPIService.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );
      
      if (response.statusCode == 201 && response.data != null) {
        Get.snackbar('Succès', 'Compte créé avec succès');
        // Auto-login ou rediriger vers login
        await login(email, password);
      }
    } catch (e) {
      Get.snackbar('Erreur', 'Inscription échouée: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
```

### Exemple : BudgetController

```dart
import 'package:get/get.dart';
import 'package:moni/helpers/services/api/api_services.dart';

class BudgetController extends GetxController {
  final budgets = <dynamic>[].obs;
  final isLoading = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    loadBudgets();
  }
  
  Future<void> loadBudgets() async {
    try {
      isLoading.value = true;
      
      final response = await BudgetService.getAllBudgets();
      
      if (response.statusCode == 200 && response.data != null) {
        budgets.value = response.data!['data'] ?? [];
      }
    } catch (e) {
      Get.snackbar('Erreur', 'Impossible de charger les budgets');
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> createBudget(double montant, String mois) async {
    try {
      isLoading.value = true;
      
      final response = await BudgetService.createBudget(
        montant: montant,
        mois: mois,
      );
      
      if (response.statusCode == 201) {
        Get.snackbar('Succès', 'Budget créé avec succès');
        await loadBudgets(); // Recharger la liste
      }
    } catch (e) {
      Get.snackbar('Erreur', 'Création du budget échouée');
    } finally {
      isLoading.value = false;
    }
  }
}
```

### Exemple : DepenseController

```dart
import 'package:get/get.dart';
import 'package:moni/helpers/services/api/api_services.dart';

class DepenseController extends GetxController {
  final depenses = <dynamic>[].obs;
  final isLoading = false.obs;
  
  Future<void> loadDepenses({
    String? startDate,
    String? endDate,
    String? categorie,
  }) async {
    try {
      isLoading.value = true;
      
      final response = await DepenseService.getAllDepenses(
        startDate: startDate,
        endDate: endDate,
        categorie: categorie,
      );
      
      if (response.statusCode == 200 && response.data != null) {
        depenses.value = response.data!['data'] ?? [];
      }
    } catch (e) {
      Get.snackbar('Erreur', 'Impossible de charger les dépenses');
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> addDepense({
    required double montant,
    required String categorie,
    required String description,
    required String date,
  }) async {
    try {
      isLoading.value = true;
      
      final response = await DepenseService.createDepense(
        montant: montant,
        categorie: categorie,
        description: description,
        date: date,
      );
      
      if (response.statusCode == 201) {
        Get.snackbar('Succès', 'Dépense ajoutée');
        await loadDepenses();
      }
    } catch (e) {
      Get.snackbar('Erreur', 'Ajout de dépense échoué');
    } finally {
      isLoading.value = false;
    }
  }
}
```

---

## 🔐 Gestion de l'Authentification

### Token JWT

Le backend utilise JWT pour l'authentification. Après connexion :

1. **Récupérer le token** : `response.data['access_token']`
2. **Sauvegarder** : `LocalStorage.setAuthToken(token)`
3. **Utilisation automatique** : Le token est ajouté automatiquement dans les headers via `APIService`

### Interceptor Dio

Le fichier `api_service.dart` ajoute automatiquement le token :

```dart
InterceptorsWrapper addAuthToken({String authTokenHeader = 'Authorization'}) =>
    InterceptorsWrapper(
      onRequest: (RequestOptions options, RequestInterceptorHandler handler) {
        options.headers.addAll(<String, dynamic>{
          authTokenHeader: "Bearer ${LocalStorage.getAuthToken()}",
        });
        handler.next(options);
      },
    );
```

---

## 📊 Format des Réponses

### Succès

```json
{
  "data": [...],
  "message": "Success"
}
```

### Erreur

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 🧪 Tester l'Intégration

### 1. Vérifier la connexion

```dart
// Dans un controller ou service
try {
  final response = await UserService.getProfile();
  print('API accessible: ${response.statusCode}');
} catch (e) {
  print('Erreur de connexion: $e');
}
```

### 2. Tester l'inscription

```dart
final response = await AuthAPIService.register(
  name: "Test User",
  email: "test@moni.app",
  phone: "+22670000000",
  password: "Test1234!",
);
```

### 3. Tester la connexion

```dart
final response = await AuthAPIService.login(
  email: "test@moni.app",
  password: "Test1234!",
);

if (response.statusCode == 200) {
  final token = response.data!['access_token'];
  print('Token: $token');
}
```

---

## 🔄 Synchronisation Hive ↔ API

Pour synchroniser les données locales (Hive) avec l'API :

```dart
// Charger depuis l'API
final response = await DepenseService.getAllDepenses();
if (response.statusCode == 200) {
  final depenses = response.data!['data'];
  
  // Sauvegarder dans Hive
  final box = await Hive.openBox<DepenseHive>('depenses');
  await box.clear();
  for (var depense in depenses) {
    await box.add(DepenseHive.fromJson(depense));
  }
}
```

---

## 📝 Checklist d'Intégration

- [x] URLs configurées dans `AppConstant`
- [x] Services API créés pour tous les modules
- [x] Fichier d'export `api_services.dart`
- [ ] Mettre à jour les controllers existants
- [ ] Tester l'inscription/connexion
- [ ] Tester la création de budget
- [ ] Tester l'ajout de dépenses/revenus
- [ ] Synchroniser avec Hive
- [ ] Gérer les erreurs réseau
- [ ] Ajouter un loading indicator

---

## 🆘 Dépannage

### Erreur de connexion

```dart
DioException [connection timeout]: null
```

**Solution** : Vérifier que l'URL est correcte et que le backend est accessible.

### Token invalide

```dart
401 Unauthorized
```

**Solution** : Le token a expiré ou est invalide. Redemander à l'utilisateur de se connecter.

### CORS Error

Si vous testez sur web, assurez-vous que le backend autorise les requêtes CORS (déjà configuré dans `main.ts`).

---

## 🎉 Prochaines Étapes

1. **Mettre à jour les controllers** existants pour utiliser les nouveaux services
2. **Tester l'application** avec le backend déployé
3. **Gérer le mode offline** avec Hive comme fallback
4. **Ajouter des indicateurs de chargement** dans l'UI
5. **Gérer les erreurs** de manière élégante

---

**L'intégration est maintenant prête ! Vous pouvez commencer à utiliser les services API dans vos controllers GetX.** 🚀
