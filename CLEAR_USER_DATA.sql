-- ============================================
-- Script SQL pour Supprimer les Données Utilisateur
-- ============================================
-- Ce script supprime toutes les données d'un utilisateur
-- SAUF son compte (email, mot de passe, etc.)
--
-- ATTENTION : Cette action est IRRÉVERSIBLE !
-- ============================================

-- 1. D'abord, récupérer l'ID de l'utilisateur
-- Remplacez 'votre-email@example.com' par l'email de l'utilisateur
SELECT id, name, email, phone 
FROM users 
WHERE email = 'votre-email@example.com';

-- Copiez l'ID obtenu et remplacez 'USER_ID_ICI' dans les commandes ci-dessous

-- ============================================
-- 2. Supprimer toutes les données utilisateur
-- ============================================

-- Supprimer les revenus
DELETE FROM revenus WHERE "userId" = 'USER_ID_ICI';

-- Supprimer les dépenses
DELETE FROM depenses WHERE "userId" = 'USER_ID_ICI';

-- Supprimer les budgets
DELETE FROM budgets WHERE "userId" = 'USER_ID_ICI';

-- Supprimer les épargnes
DELETE FROM epargnes WHERE "userId" = 'USER_ID_ICI';

-- Supprimer les notifications
DELETE FROM notifications WHERE "userId" = 'USER_ID_ICI';

-- Supprimer les conseils
DELETE FROM conseils WHERE "userId" = 'USER_ID_ICI';

-- Supprimer les codes OTP (optionnel)
DELETE FROM otp_codes WHERE "userId" = 'USER_ID_ICI';

-- ============================================
-- 3. Vérifier que les données sont supprimées
-- ============================================

-- Vérifier les revenus restants
SELECT COUNT(*) as revenus_count FROM revenus WHERE "userId" = 'USER_ID_ICI';

-- Vérifier les dépenses restantes
SELECT COUNT(*) as depenses_count FROM depenses WHERE "userId" = 'USER_ID_ICI';

-- Vérifier les budgets restants
SELECT COUNT(*) as budgets_count FROM budgets WHERE "userId" = 'USER_ID_ICI';

-- Vérifier les épargnes restantes
SELECT COUNT(*) as epargnes_count FROM epargnes WHERE "userId" = 'USER_ID_ICI';

-- ============================================
-- 4. Vérifier que le compte utilisateur existe toujours
-- ============================================

SELECT id, name, email, phone, "createdAt" 
FROM users 
WHERE id = 'USER_ID_ICI';

-- ============================================
-- ALTERNATIVE : Tout supprimer en une seule transaction
-- ============================================

BEGIN;

-- Remplacez 'USER_ID_ICI' par l'ID réel de l'utilisateur
DELETE FROM revenus WHERE "userId" = 'USER_ID_ICI';
DELETE FROM depenses WHERE "userId" = 'USER_ID_ICI';
DELETE FROM budgets WHERE "userId" = 'USER_ID_ICI';
DELETE FROM epargnes WHERE "userId" = 'USER_ID_ICI';
DELETE FROM notifications WHERE "userId" = 'USER_ID_ICI';
DELETE FROM conseils WHERE "userId" = 'USER_ID_ICI';
DELETE FROM otp_codes WHERE "userId" = 'USER_ID_ICI';

-- Si tout est OK, valider la transaction
COMMIT;

-- Si vous voulez annuler, utilisez :
-- ROLLBACK;
