# Supabase KeepAlive Fix — Anti-pause Free Tier

Documentation autonome et réutilisable pour corriger le endpoint `api/ping.js`
dans tout projet dupliqué utilisant Supabase Free Tier via Vercel.

---

## 1. Contexte / Problème

`api/ping.js` est une Vercel Serverless Function censée empêcher la pause
automatique des projets Supabase Free Tier (pause après 7 jours d'inactivité DB).

**Avant correctif** : le endpoint appelait `SUPABASE_URL/auth/v1/health`, qui
est le health check du service Auth (GoTrue). Cet endpoint ne génère **aucune
requête sur la base Postgres**. Résultat : le "ping" ne comptait pas comme
activité pour Supabase, et la pause automatique n'était pas prévenue.

**Après correctif** : le endpoint exécute une vraie requête SELECT via l'API
REST PostgREST sur une table dédiée `public.keepalive`, générant ainsi une
activité réelle sur la base de données.

---

## 2. Solution — Partie Supabase (SQL)

Exécuter ce SQL dans le SQL Editor de Supabase **AVANT de déployer le code
modifié** — sinon le endpoint renverra 503/404 (table inexistante).

```sql
CREATE TABLE IF NOT EXISTS public.keepalive (
  id serial primary key,
  created_at timestamptz default now()
);

INSERT INTO public.keepalive DEFAULT VALUES;

ALTER TABLE public.keepalive ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_anon_select
ON public.keepalive
FOR SELECT
TO anon
USING (true);
```

> **Important** : la table doit exister et être lisible avec la clé anon avant
> tout déploiement. Voir section 4 pour la vérification.

---

## 3. Solution — Partie code (api/ping.js)

Tous les changements appliqués au fichier. Aucune nouvelle dépendance npm —
`fetch` natif suffit.

### 3.1 Commentaire d'en-tête

| Avant | Après |
|---|---|
| `// Calls the Supabase Auth health endpoint to prevent project pausing.` | `// Executes a real PostgREST query against a dedicated keepalive table`<br>`// to generate actual database activity and prevent project pausing.` |

### 3.2 Constante de path

| Ligne | Avant | Après |
|---|---|---|
| ~24 | `const SUPABASE_HEALTH_PATH = '/auth/v1/health';` | `const SUPABASE_QUERY_PATH = '/rest/v1/keepalive?select=id&limit=1';` |

### 3.3 Variable URL (dans le handler)

| Ligne | Avant | Après |
|---|---|---|
| ~89 | `const healthUrl = \`\${supabaseUrl}\${SUPABASE_HEALTH_PATH}\`;` | `const queryUrl = \`\${supabaseUrl}\${SUPABASE_QUERY_PATH}\`;` |

### 3.4 Log de démarrage

| Ligne | Avant | Après |
|---|---|---|
| ~91 | `` console.log(`[api/ping] Starting — GET ${SUPABASE_HEALTH_PATH}`); `` | `` console.log(`[api/ping] Starting — GET ${SUPABASE_QUERY_PATH}`); `` |

### 3.5 Headers du fetch() — ajout de `Authorization`

| Ligne | Avant | Après |
|---|---|---|
| ~99-103 | `headers: { 'Content-Type': 'application/json', apikey: supabaseKey }` | `headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: \`Bearer \${supabaseKey}\` }` |

**Pourquoi** : le endpoint Auth (`/auth/v1/health`) n'exige que le header
`apikey`. PostgREST (`/rest/v1/...`) exige les deux : `apikey` **et**
`Authorization: Bearer {key}`. Sans `Authorization`, PostgREST renvoie 401.

### 3.6 Ce qui NE change PAS

- Structure JSON de réponse : `{ ok, service, status, httpStatus, latency, timestamp, project, error }`
- Timeout : 10000ms avec `AbortController`
- Gestion d'erreur : `AbortError` → timeout, autres → unreachable
- Rejet des méthodes non-GET : 405
- Fonctions `extractProjectRef`, `buildBody`, `sendJson` : inchangées
- Aucune dépendance npm ajoutée

---

## 4. Procédure de vérification

### 4.1 Vérifier la table Supabase (avant déploiement)

```bash
curl -s -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/keepalive?select=id&limit=1"
```

**Réponse attendue (succès)** :
```json
[{"id":1}]
```

Si erreur (401/404/503) → la table ou la policy RLS est absente. Ne pas déployer
le code avant d'avoir corrigé.

### 4.2 Vérifier le endpoint après déploiement

```bash
curl -s https://<domaine>/api/ping
```

**Réponse attendue (succès)** :
```json
{
  "ok": true,
  "service": "supabase",
  "status": "reachable",
  "httpStatus": 200,
  "latency": 528,
  "timestamp": "2026-07-08T13:51:25.891Z",
  "project": "xxxxxxxxxxxxxxxxxxxx"
}
```

---

## 5. Checklist réutilisable

Copier-coller cette checklist dans chaque nouveau projet à corriger :

```
- [ ] 1. Lire .env → récupérer SUPABASE_URL et SUPABASE_ANON_KEY
- [ ] 2. Exécuter le SQL keepalive dans le SQL Editor Supabase
- [ ] 3. Vérifier curl GET /rest/v1/keepalive?select=id&limit=1 → 200 + [{"id":1}]
- [ ] 4. Modifier api/ping.js :
       - [ ] Remplacer SUPABASE_HEALTH_PATH par SUPABASE_QUERY_PATH
       - [ ] Renommer healthUrl → queryUrl
       - [ ] Ajouter Authorization: Bearer {key} dans les headers fetch()
       - [ ] Mettre à jour les commentaires en haut du fichier
       - [ ] Mettre à jour le log de démarrage
- [ ] 5. Vérifier qu'aucune dépendance npm n'a été ajoutée
- [ ] 6. Commit + push → déploiement Vercel automatique
- [ ] 7. Tester GET https://<domaine>/api/ping → 200 + "status":"reachable"
```

---

## Référence rapide — Diff minimal

Si le fichier `api/ping.js` est identique à l'original, voici un équivalent
textuel du diff à appliquer :

```
-  const SUPABASE_HEALTH_PATH = '/auth/v1/health';
+  const SUPABASE_QUERY_PATH = '/rest/v1/keepalive?select=id&limit=1';

-  const healthUrl = `${supabaseUrl}${SUPABASE_HEALTH_PATH}`;
+  const queryUrl = `${supabaseUrl}${SUPABASE_QUERY_PATH}`;

-  console.log(`[api/ping] Starting — GET ${SUPABASE_HEALTH_PATH}`);
+  console.log(`[api/ping] Starting — GET ${SUPABASE_QUERY_PATH}`);

-  const response = await fetch(healthUrl, {
+  const response = await fetch(queryUrl, {
     signal: controller.signal,
     headers: {
       'Content-Type': 'application/json',
       apikey: supabaseKey,
+      Authorization: `Bearer ${supabaseKey}`
     }
   });
```
