# AINDALIA — Digital Menu

## Stack
Vanilla JS SPA (ES6 modules, no bundler) · Supabase (`categories`, `menu_items`, `settings`) · i18next + lang detector from esm.sh · Dark-mode CSS only

## Dev server (required — `file://` does not work with ES6 modules)
```
npx serve . --listen 3000
```

## Entrypoint & architecture
`js/main.js` → `await i18nReady` → `translatePage()` → `initMenu()` → `initNavigation()` → `initAuth()`

| File | Role |
|---|---|
| `menu.js` | Shared state (`MENU_DATA`, `CATEGORIES`, `SETTINGS`, `WA_NUMBER`, `cart`), all rendering, WhatsApp. Filters by `category_id` (FK, never text). Shows `showToast()` on load failure — no fallback data |
| `supabase.js` | Lazy `createClient` from CDN — **no top-level `await`**. All queries via `safeQuery`/`safeMutate` wrappers (never throw, return `[]`/`null` on failure) |
| `admin-dashboard.js` | Inline dashboard (no separate page). XLSX columns: `Nom (FR)`/`Nom (EN)`/`Nom (ES)`/`Nom (AR)` — dynamic from `LANGUAGES` config |
| `modal.js` | Reusable `showConfirm`/`showAlert`/`showPrompt` for admin dashboard |
| `navigation.js` | SPA routing via `[data-page]` delegation |
| `auth.js` | Login/logout/session via `supabaseReady` |
| `i18n.js` | Exports `t()`, `localized()`, `i18nReady`, `translatePage()`, `changeLanguage()`. Arabic sets `dir="rtl"` on `<html>` |
| `locales/config.js` | `LANGUAGES = ['fr','en','es','ar']` — add a language here + locale file |
| `config.js` | `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public, safe for client) |
| `main.js` | Boot, auth lock system (3 attempts → 24h block via localStorage), auth UI |

## Supabase
- Schema: `supabase-schema.sql` (tables, RLS, seed data) — **authoritative source of truth**
- Project ref: `dnjqsgnpvpvtttgnjolg`
- `.env` at root with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_SBP`
- To run SQL: `POST https://api.supabase.com/v1/projects/{ref}/database/query` with PAT as Bearer + `{"query": "..."}`
- DB text fields (`categories.name`, `menu_items.name`, `menu_items.description`) are JSONB: `{fr: "...", en: "...", es: "...", ar: "..."}` — use `localized(value)` to display, pass the full JSONB object when saving
- `settings` is key-value — `getSettings()` returns `{ key: value }` map
- Image upload resizes to 800px via Canvas before Storage upload
- `supabase.js:33` — client créé avec `{ auth: { persistSession: false } }` : session en mémoire uniquement, pas de localStorage. RLS fonctionne car le Bearer token reste en mémoire après `login()`. Au rechargement, session perdue → reconnexion requise.
- `categories.icon_svg` column exists but icon UI was removed — field kept for DB compat only

## Conventions
- IDs: `camelCase`; classes: `kebab-case`; data attributes: `kebab-case`
- Currency: `DH` (no symbol)
- No emoji — inline SVG only
- RTL overrides in `css/rtl.css` for Arabic
- i18n: `t('key')` in JS, `data-i18n` in HTML, `data-i18n-placeholder`/`data-i18n-title`/`data-i18n-alt`/`data-i18n-content` for attributes

## Gotchas
- `i18next` / `supabase-js` are dynamically imported from CDN — never `await` at module top level
- `initMenu()` must be called **after** `translatePage()` and must be `await`ed
- Admin-dashboard uses arrow expression-body template literals (`cats.map(cat => \`...\`)`) — no `{ return }`, no stray `;` or `}` after the closing backtick
- `showPage('admin')` after login renders the dashboard inline — not a separate URL/page
- i18n: always add new keys to all 4 locale files (`fr.js`, `en.js`, `es.js`, `ar.js`)
- `categories.name` / `menu_items.category_id` is a real FK (`ON DELETE RESTRICT`) — never filter by text
- XLSX import is backward-compatible: old files with only FR/EN/ES columns still work (missing lang columns default to empty)
- Auth credentials: `admin@aindalia.com` / `aindalia2026`
- Auth has client-side lock: 3 failed attempts → 24h block (stored in localStorage key `dahabcoffee_lock`)
- **No tests exist** — Playwright `@playwright/test@^1.61.0` is a dependency but no test files or config are present
- **Stale docs**: `README.md` references a `luxora/` subdirectory (files are at root). `SUPABASE_SETUP.md` and `SUPABASE_MIGRATION_GUIDE.md` claim fallback data exists in `menu.js` — it does not; the app shows toasts on failure
- `.env` contains real Supabase secrets (in `.gitignore`). `SUPABASE_MIGRATION_GUIDE.md` also contains secrets and is gitignored
