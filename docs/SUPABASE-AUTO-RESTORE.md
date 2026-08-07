# SUPABASE-AUTO-RESTORE — Architecture de référence

Documentation de référence décrivant l'implémentation validée de l'auto-restore
Supabase intégré au endpoint KeepAlive `/api/ping`.

Ce document est basé sur l'implémentation réelle du projet et sert de modèle
pour tous les projets utilisant la même architecture (Vercel + Supabase).

---

## 1. Objectif

Le endpoint `/api/ping` a une double fonction :

1. **Health check** : exécute une vraie requête PostgREST (`/rest/v1/keepalive`)
   pour générer de l'activité base de données et empêcher la pause automatique
   des projets Supabase Free Tier.

2. **Auto-restore** : détecte un projet en pause (HTTP 540) et tente
   automatiquement un restore via la Supabase Management API, à condition
   que l'appelant soit autorisé (header `X-KeepAlive-Secret`).

---

## 2. Variables d'environnement

| Variable | Obligatoire | Rôle |
|---|---|---|
| `SUPABASE_URL` | Oui | URL du projet Supabase (ex: `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Oui | Clé anon pour les requêtes PostgREST (health check) |
| `SUPABASE_SBP` | Oui (restore) | Personal Access Token Supabase pour la Management API |
| `KEEPALIVE_SECRET` | Oui (restore) | Secret partagé entre Google Apps Script et Vercel |

**IMPORTANT :**

- `SUPABASE_SBP` et `KEEPALIVE_SECRET` sont **deux secrets distincts**.
- `SUPABASE_SBP` = Personal Access Token (préfixe `sbp_`) utilisé uniquement
  pour appeler la Management API Supabase (`api.supabase.com`).
- `KEEPALIVE_SECRET` = secret arbitraire partagé entre le Google Apps Script
  et Vercel, utilisé uniquement pour autoriser l'action de restore.
- **Ne jamais confondre ces deux secrets.**
- **Ne jamais hardcoder leurs valeurs.**
- **Ne jamais les logger ou les retourner dans les réponses JSON.**

---

## 3. Flux complet

```
Google Apps Script
     │
     │  GET /api/ping
     │  + X-KeepAlive-Secret (optionnel)
     ▼
┌─────────────────────────────────────────┐
│               Vercel                     │
│                                          │
│  api/ping.js                             │
│  ├── Validation méthode HTTP (GET)       │
│  ├── Validation variables d'env          │
│  ├── Health check Supabase               │
│  │   ├── 2xx → reachable (HTTP 200)      │
│  │   ├── 540 → projet en pause           │
│  │   └── autre → unreachable (HTTP 503)  │
│  │                                       │
│  └── Si HTTP 540 :                       │
│      ├── Vérifie X-KeepAlive-Secret      │
│      │   ├── Absent/invalide → paused +   │
│      │   │   not_authorized (HTTP 503)   │
│      │   └── Valide → tente le restore   │
│      │                                   │
│      └── Restore via Management API      │
│          ├── 200 → restore_requested      │
│          ├── 429 → restore_failed (rate_limited) │
│          ├── timeout → restore_failed     │
│          └── autre → restore_failed       │
└─────────────────────────────────────────┘
```

---

## 4. Comportement HTTP

### Tableau des réponses

| Code HTTP | `status` | `restore` | Condition |
|---|---|---|---|
| **200** | `reachable` | *(absent)* | Supabase répond 2xx |
| **405** | `unreachable` | *(absent)* | Méthode HTTP non GET |
| **500** | `unreachable` | *(absent)* | `SUPABASE_URL` ou `SUPABASE_ANON_KEY` manquant |
| **503** | `unreachable` | *(absent)* | Supabase répond code non-2xx, non-540 |
| **503** | `timeout` | *(absent)* | Health check timeout (10s) |
| **503** | `unreachable` | *(absent)* | Erreur réseau health check |
| **503** | `paused` | `not_authorized` | HTTP 540 + secret absent/invalide |
| **503** | `restore_failed` | `project_ref_missing` | HTTP 540 + project ref non déterminable |
| **503** | `restore_requested` | `requested` | HTTP 540 + restore Management API 200 |
| **503** | `restore_failed` | `rate_limited` | HTTP 540 + restore Management API 429 |
| **503** | `restore_failed` | `failed` | HTTP 540 + restore Management API 401/403/5xx ou timeout |

### Champs JSON standard

| Champ | Type | Description |
|---|---|---|
| `ok` | boolean | `true` si Supabase reachable, `false` sinon |
| `service` | string | Toujours `"supabase"` |
| `status` | string | État du health check (voir tableau ci-dessus) |
| `httpStatus` | number | Code HTTP de la réponse |
| `latency` | number | Temps de réponse en millisecondes |
| `timestamp` | string | Horodatage ISO 8601 |
| `project` | string | Référence du projet Supabase (extrait de l'URL) |
| `error` | string | Message d'erreur (uniquement si applicable) |
| `restore` | string | Résultat du restore (uniquement si HTTP 540) |

---

## 5. Sécurité

### Principes appliqués

1. **Le health check reste public.**
   Un `GET /api/ping` sans header `X-KeepAlive-Secret` fonctionne normalement
   et retourne le statut Supabase. Aucune authentification requise.

2. **Le restore est protégé par `X-KeepAlive-Secret`.**
   L'action de restore (appel à la Management API) n'est déclenchée QUE si
   le header `X-KeepAlive-Secret` correspond à la variable d'environnement
   `KEEPALIVE_SECRET`.

3. **`SUPABASE_SBP` n'est jamais exposé.**
   Le token Management API est utilisé uniquement côté serveur dans le header
   `Authorization` de l'appel `fetch` à `api.supabase.com`. Il n'apparaît
   jamais dans les logs ni dans les réponses JSON.

4. **`KEEPALIVE_SECRET` n'est jamais exposé.**
   Le secret est uniquement comparé (`incomingSecret !== keepAliveSecret`),
   jamais loggé, jamais retourné.

5. **Aucun secret dans les logs.**
   Les logs ne contiennent que des messages génériques : codes HTTP,
   résultats de restore (`requested`, `rate_limited`, `failed`), temps
   de latence. Jamais les valeurs des tokens ou secrets.

6. **Aucun secret hardcodé.**
   Tous les secrets proviennent de `process.env.*`. Rien n'est écrit en dur
   dans le code source.

7. **Pas de détails internes dans les réponses.**
   Les réponses d'erreur ne contiennent ni stack trace, ni détails
   d'implémentation, ni valeurs de configuration.

---

## 6. Management API

### Endpoint

```
POST https://api.supabase.com/v1/projects/{projectRef}/restore
```

### Authentification

```
Authorization: Bearer ${SUPABASE_SBP}
```

### Extraction du projectRef

Le project ref est extrait dynamiquement depuis `SUPABASE_URL` via la fonction
`extractProjectRef()` qui parse le hostname (`{ref}.supabase.co`). Aucun
hardcoding.

Si le project ref ne peut pas être déterminé (URL custom, format inconnu),
le restore n'est pas tenté et la réponse indique `restore: "project_ref_missing"`.

### Timeout

L'appel à la Management API a un timeout de **5 secondes** via `AbortController`.
Si le timeout est atteint, le restore est considéré comme `failed`.

### Gestion des réponses

| Réponse Management API | Comportement |
|---|---|
| **200** | Restore accepté → `restore: "requested"` |
| **429** | Rate limit → `restore: "rate_limited"` |
| **401/403** | Authentification refusée → `restore: "failed"` |
| **5xx** | Erreur serveur Supabase → `restore: "failed"` |
| **Timeout** | Délai dépassé (5s) → `restore: "failed"` |
| **Erreur réseau** | Connexion impossible → `restore: "failed"` |

---

## 7. KEEPALIVE_SECRET — Configuration Google Apps Script

Le Google Apps Script doit envoyer le header `X-KeepAlive-Secret` avec la
valeur du secret partagé :

```javascript
function keepAlive() {
  var options = {
    headers: {
      'X-KeepAlive-Secret': 'VALEUR_DU_SECRET'
    }
  };
  UrlFetchApp.fetch('https://{domain}/api/ping', options);
}
```

**Ne jamais écrire la valeur réelle du secret dans la documentation ou le
code source.** La valeur doit être stockée dans :
- `.env` du projet (variable `KEEPALIVE_SECRET`)
- Environnement Vercel (Environment Variables)
- Propriétés du script Google Apps Script

---

## 8. Structure de `api/ping.js`

### Fonctions

| Fonction | Rôle |
|---|---|
| `extractProjectRef(url)` | Extrait le project ref depuis l'URL Supabase |
| `buildBody(ok, httpStatus, latency, status, errorMessage, restore)` | Construit le corps JSON standardisé |
| `sendJson(res, httpStatus, body)` | Définit les headers et envoie la réponse JSON |
| `restoreProject(projectRef)` | Appelle la Management API pour restaurer le projet |
| `handler(req, res)` | Point d'entrée de la Serverless Function |

### Blocs logiques dans le handler

1. **Validation méthode HTTP** — rejette tout sauf GET (405)
2. **Validation variables d'environnement** — vérifie `SUPABASE_URL` et `SUPABASE_ANON_KEY` (500)
3. **Health check** — fetch PostgREST avec `AbortController` (timeout 10s)
4. **Succès** — HTTP 2xx → `reachable` (200)
5. **Détection HTTP 540** — projet en pause
   - Vérification `X-KeepAlive-Secret`
   - Extraction project ref
   - Appel `restoreProject()`
6. **Erreur générique** — autre code HTTP → `unreachable` (503)
7. **Gestion timeout** — `AbortError` → `timeout` (503)
8. **Gestion erreur réseau** — exception → `unreachable` (503)

---

## 9. Guide pour appliquer cette architecture à un autre projet

Lorsqu'un autre projet doit adopter cette architecture, suivre ces étapes :

1. **Lire `AGENTS.md`** du projet cible.
2. **Lire le `api/ping.js` existant** pour comprendre son fonctionnement actuel.
3. **Lire le `.env` existant** pour identifier les variables déjà présentes.
4. **Identifier les variables Supabase déjà présentes** (`SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `SUPABASE_SBP`, etc.).
5. **Vérifier si `SUPABASE_SBP` existe** — c'est le token Management API.
6. **Ajouter `KEEPALIVE_SECRET`** uniquement si elle n'existe pas déjà.
7. **Ne jamais hardcoder de secret** — tout doit venir de `process.env`.
8. **Préserver le health check existant** — ne pas casser le fonctionnement
   normal (HTTP 200 → `reachable`).
9. **Ajouter uniquement la logique HTTP 540 + auto-restore** sans réécrire
   inutilement le fichier.
10. **Ajouter le timeout Management API** (5 secondes via `AbortController`).
11. **Ajouter la protection `X-KeepAlive-Secret`** pour l'action de restore.
12. **Tester tous les scénarios** : health check normal, HTTP 540 sans secret,
    HTTP 540 avec mauvais secret, restore réussi, restore rate-limited,
    restore échoué, timeout Management API.
13. **Ne pas modifier les autres fichiers sans nécessité.**
14. **Ne pas faire de git push sans ordre explicite.**

---

## 10. Checklist de validation

```
[ ] AGENTS.md lu
[ ] api/ping.js analysé
[ ] .env analysé
[ ] SUPABASE_URL vérifié
[ ] SUPABASE_ANON_KEY vérifié
[ ] SUPABASE_SBP vérifié
[ ] KEEPALIVE_SECRET configuré
[ ] HTTP 540 détecté
[ ] X-KeepAlive-Secret vérifié
[ ] projectRef extrait correctement
[ ] Management API restore implémentée
[ ] timeout 5 secondes
[ ] aucun secret dans les logs
[ ] aucun secret hardcodé
[ ] HTTP 200 testé (reachable)
[ ] HTTP 540 + pas de secret testé (paused / not_authorized)
[ ] HTTP 540 + mauvais secret testé (paused / not_authorized)
[ ] HTTP 540 + bon secret + API 200 testé (restore_requested)
[ ] HTTP 540 + bon secret + API 429 testé (rate_limited)
[ ] HTTP 540 + bon secret + API 401/403 testé (failed)
[ ] HTTP 540 + bon secret + timeout API testé (failed)
[ ] documentation mise à jour
```

---

## 11. Règle importante pour les futurs projets

**Cette documentation décrit le modèle de référence validé pour l'auto-restore
Supabase. Lorsqu'elle est utilisée dans un autre projet, OpenCode doit d'abord
comparer la structure existante du projet avec ce modèle et adapter
l'implémentation sans casser les fonctionnalités existantes.**

---

## Historique

| Version | Date | Description |
|---|---|---|
| 1.0 | Août 2026 | Version initiale — basée sur l'implémentation validée du projet AIN DALIA |
