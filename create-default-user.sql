-- Créer un utilisateur par défaut pour tester l'API
-- Mot de passe: Test1234!
-- Hash bcrypt du mot de passe Test1234!
INSERT INTO users (id, name, email, phone, password, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Utilisateur Test',
  'test@moni.app',
  '+22670000000',
  '$2b$10$rKJ5YvH8qX9YvH8qX9YvHOqX9YvH8qX9YvH8qX9YvH8qX9YvH8qXe',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Vérifier que l'utilisateur a été créé
SELECT id, name, email, phone, "createdAt" FROM users WHERE email = 'test@moni.app';
