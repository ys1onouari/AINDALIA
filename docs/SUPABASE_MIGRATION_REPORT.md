# SUPABASE MIGRATION REPORT — AINDALIA

**Date :** 2026-06-26  
**Nouveau projet :** `dnjqsgnpvpvtttgnjolg` (eu-west-1)  
**Projet précédent :** `kwurnxhbftgaxkbikvdd` (config.js)  
**Ancien projet :** `hmglnevnhzdewbohadil` (documentation de référence)

---

## Résumé

Migration complète de l'ancienne base Supabase vers la nouvelle base déjà configurée dans `.env`.

---

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `js/config.js` | `SUPABASE_URL` mis à jour de `kwurnxhbftgaxkbikvdd` → `dnjqsgnpvpvtttgnjolg` |
| `js/config.js` | `SUPABASE_ANON_KEY` mis à jour avec la clé du nouveau projet |
| `supabase/.temp/linked-project.json` | Ref mis à jour de `kwurnxhbftgaxkbikvdd` → `dnjqsgnpvpvtttgnjolg` |
| `docs/AGENTS.md` | Project ref mis à jour de `twcwukrgbgspqajofels` → `dnjqsgnpvpvtttgnjolg` |

**`.env` — NON MODIFIÉ** (conformément à la consigne)

---

## Opérations réalisées sur le nouveau projet (via Management API)

### 1. Création des tables
```sql
categories (id BIGINT PK, name JSONB, icon_svg TEXT, sort_order INT)
menu_items (id BIGINT PK, name JSONB, category_id BIGINT FK→categories, 
            price NUMERIC(6,1), description JSONB, tags TEXT[], 
            available BOOLEAN, popular BOOLEAN, image_url TEXT)
settings  (key TEXT PK, value TEXT)
CREATE INDEX idx_menu_items_category_id
```

### 2. Bucket Storage
Bucket `dish-images` créé (public)

### 3. Politiques Storage
- `Public read` — SELECT sur `dish-images`
- `Auth upload` — INSERT si authentifié
- `Auth delete` — DELETE si authentifié

### 4. Row Level Security (RLS)
- RLS activé sur `categories`, `menu_items`, `settings`
- 12 policies créées (SELECT public + INSERT/UPDATE/DELETE auth pour chaque table)

### 5. Données seed
| Table | Lignes |
|---|---|
| `categories` | 7 (Entrées → Boissons) |
| `menu_items` | 26 (Tartare de Thon → Thé à la Menthe) |
| `settings` | 11 (restaurant_name → ordering_enabled) |

### 6. Admin user
- Email : `admin@aindalia.com`
- Password : `aindalia2026`
- Créé via GoTrue Admin API (`/auth/v1/admin/users`)

---

## Tests fonctionnels

| Fonctionnalité | Statut |
|---|---|
| Connexion app | ✅ Menu chargé depuis la nouvelle DB |
| Login admin | ✅ Connexion réussie avec credentials seed |
| Dashboard admin | ✅ CRUD plats/catégories affiché correctement |
| Données seed | ✅ 26 plats, 7 catégories, 11 settings |
| RLS — lecture publique | ✅ READ accessible sans auth |
| RLS — écriture non-auth | ✅ Bloquée (return 400) |
| Bucket storage | ✅ Existant, public, policies actives |
| Traductions EN/ES/AR | ✅ Switch disponible |
| Contact | ✅ Tous les champs affichés |

---

## Problèmes rencontrés et solutions

| Problème | Cause | Solution |
|---|---|---|
| `supabase-schema.sql` contenait des apostrophes françaises non échappées (`l'avocat`, `d'agneau`, etc.) | SQL invalide pour passage via Management API | Correction manuelle des apostrophes en `''` et exécution par lots de 6 items |
| Timeout lors de l'exécution du SQL complet en un seul appel | Payload trop volumineux pour l'API | Découpage en 4 étapes (tables, bucket, RLS, seed) |
| `supabase_auth.admin_create_user()` inaccessible | Fonction réservée au schéma interne Supabase | Utilisation du GoTrue Admin API (`/auth/v1/admin/users`) |
| Doublon "Tartare de Thon" | Test insert préalable non nettoyé | Suppression de l'item ID 1 via DELETE SQL |
| Mismatch config.js vs .env | Anciennes clés présentes dans config.js | Mise à jour config.js avec les valeurs du .env |

---

## Confirmations

- ✅ **Le projet utilise bien la nouvelle base Supabase** (`dnjqsgnpvpvtttgnjolg`)
- ✅ **Le fichier `.env` est resté inchangé**
- ✅ **Toutes les fonctionnalités utilisent désormais la nouvelle base**
- ✅ **Aucune dépendance active à l'ancienne base Supabase ne subsiste** (hors fichiers historiques conservés volontairement : `docs/SUPABASE_MIGRATION_GUIDE.md` et `docs/SUPABASE_SETUP.md` qui documentent l'ancienne config à titre de référence)

---

## Fichiers contenant encore l'ancienne config (documentation uniquement)

| Fichier | Raison |
|---|---|
| `docs/SUPABASE_MIGRATION_GUIDE.md` | Guide de migration, contient l'ancien ref comme exemple |
| `docs/SUPABASE_SETUP.md` | Documentation de référence |
| `docs/PROJECT_BLUEPRINT.md` | Contient les anciennes valeurs documentées |
