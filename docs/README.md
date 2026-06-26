# AINDALIA — Menu Digital

## Architecture

```
├── index.html            # Structure HTML (SPA, pages multiples)
├── logo.png              # Logo du restaurant
├── AGENTS.md             # Instructions pour agents IA
├── css/
│   ├── main.css          # Point d'entrée CSS — importe tous les fichiers
│   ├── variables.css     # Custom properties (couleurs, ombres, keyframes)
│   ├── base.css          # Reset, body, scrollbar, typographie
│   ├── layout.css        # Système de pages, sections, grilles
│   ├── components.css    # Tous les composants (nav, cartes, panier, toast…)
│   ├── responsive.css    # Media queries (desktop)
│   └── rtl.css           # Overrides RTL pour l'arabe
├── js/
│   ├── main.js           # Point d'entrée JS — bootstrap, lock système, auth UI
│   ├── config.js         # SUPABASE_URL et SUPABASE_ANON_KEY
│   ├── supabase.js       # Client Supabase singleton + CRUD
│   ├── auth.js           # Login/logout Supabase Auth
│   ├── menu.js           # État partagé, rendu menu/contact, panier, WhatsApp
│   ├── navigation.js     # Routage SPA via data-page
│   ├── i18n.js           # Configuration i18next, traduction
│   ├── modal.js          # Modales réutilisables (confirm/alert/prompt)
│   ├── admin-dashboard.js # Dashboard admin (CRUD, XLSX, config)
│   └── locales/
│       ├── config.js     # LANGUAGES = ['fr','en','es','ar']
│       ├── fr.js         # Traductions françaises
│       ├── en.js         # Traductions anglaises
│       ├── es.js         # Traductions espagnoles
│       └── ar.js         # Traductions arabes
├── supabase-schema.sql   # Schéma DB + policies + seed
├── supabase-migration-v1.sql  # Migration TEXT → JSONB
├── supabase-migration-v2.sql  # Migration ajout clé "ar"
├── supabase-rollback-v1.sql   # Rollback migration v1
└── docs/                 # Rapports d'audit
```

## Conventions

- **Fichiers** : `kebab-case` (ex. `main.css`, `navigation.js`)
- **Classes CSS** : `kebab-case` (ex. `.dish-card`, `.nav-item`)
- **Variables JS** : `camelCase` (ex. `activeFilter`, `showPage`)
- **IDs** : `camelCase` (ex. `#searchInput`, `#cartBadge`)
- **Data attributes** : `kebab-case` (ex. `data-page`, `data-action`, `data-category`)

## Fonctionnalités

- Navigation multi-pages (Home, Menu, Contact, Admin)
- Panier d'achat avec quantités
- Multilingue FR / EN / ES / AR avec RTL pour l'arabe
- Filtres par catégorie
- Commande directe via WhatsApp
- Dashboard admin inline (CRUD plats, catégories, configuration)
- Import/Export XLSX des plats et catégories
- Upload d'images (redimensionnement via Canvas 800px)
- Animations au scroll (Intersection Observer)
- Design responsive (mobile-first)

## Lancement

Les modules ES6 (`type="module"`) nécessitent un serveur HTTP local.
Ouvrir `index.html` directement (via `file://`) **ne fonctionnera pas**.

### Option 1 : Node.js (préféré)
```bash
npx serve . --listen 3000
```

### Option 2 : Python
```bash
python -m http.server 8000
# → http://localhost:8000
```

### Option 4 : VS Code
Utiliser l'extension **Live Server**.

## Compatibilité

- Chrome / Firefox / Safari / Edge (versions récentes)
- ES6 modules supportés
- CSS custom properties (CSS Variables)

## Stack

- **Frontend** : Vanilla JS (ES6 modules, pas de bundler)
- **Backend** : Supabase (BaaS — Database, Auth, Storage)
- **i18n** : i18next + i18next-browser-languagedetector (CDN esm.sh)
- **Polices** : Playfair Display, Inter, Cormorant Garamond, Tajawal, Noto Naskh Arabic (via Google Fonts)
