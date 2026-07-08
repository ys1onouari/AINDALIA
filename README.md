# AIN DALIA

## KeepAlive — Anti-pause Supabase Free Tier

Le endpoint `api/ping.js` exécute une requête PostgREST réelle sur la table
`public.keepalive` pour générer de l'activité base de données et empêcher la
pause automatique des projets Supabase Free Tier (inactivité de 7 jours).

### Prérequis avant tout déploiement sur un nouveau projet Supabase

1. Exécuter la migration `supabase/migrations/001_create_keepalive_table.sql`
   dans le SQL Editor Supabase.

2. Vérifier que la table est accessible en lecture publique :
   ```
   GET {SUPABASE_URL}/rest/v1/keepalive?select=id&limit=1
   Headers: apikey + Authorization Bearer (anon key)
   ```

3. Déployer le projet Vercel avec les variables d'environnement :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Test

```
curl https://aindalia.menuscan.space/api/ping
```

Réponse attendue : `{"ok":true,"service":"supabase","status":"reachable",...}`
