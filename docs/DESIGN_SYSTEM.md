# DESIGN SYSTEM — AINDALIA

> Source unique de vérité. Toute valeur visuelle du projet
> passe par css/variables.css.

---

## 1. Couleurs

### Brand & UI

| Variable | Valeur hex | Usage |
|---|---|---|
| `--primary` | `#A86A2A` | Brun Caramel — boutons, `::selection`, scrollbar, `.lang-btn.active`, toggles, `.cart-badge` |
| `--primary-dark` | `#5B3718` | `.add-cart-btn`, texte `.badge-unavail` |
| `--primary-light` | `#8B6035` | Variante claire (réservée) |
| `--secondary` | `#D4A64A` | Doré Principal — nav active, `::after` bars, `.chip.active`, bordures focus |
| `--secondary-light` | `#E6C55A` | Doré clair (réservé) |
| `--accent` | `#B8842F` | Doré Foncé — `.hero-eyebrow`, `.dish-price`, `.cart-item-price`, `.cart-total-amount` |
| `--accent-dim` | `rgba(184,132,47,0.12)` | Accent à faible opacité (réservé) |
| `--white` | `#ffffff` | Blanc pur — textes sur fonds primaires/gradients |
| `--bg` | `#111111` | Fond principal page + fallback admin |
| `--bg2` | `#1E1208` | Inputs, scrollbar track, admin sidebar, shimmer |
| `--bg3` | `#2A1A0E` | `dish-img-wrap` fallback, `auth-toggle` off, upload label |
| `--card` | `rgba(255,255,255,0.04)` | Fond de toutes les cartes (cat-card, dish-card, auth-modal, admin-modal) |
| `--card-hover` | `rgba(255,255,255,0.07)` | Fond cartes au survol |
| `--glass` | `rgba(17,17,17,0.72)` | Fond vitré — top-nav, bottom-nav, cart-sidebar, toast |
| `--glass-border` | `rgba(212,166,74,0.12)` | Bordure gold tintée de tous les éléments vitrés |
| `--text` | `#F8F6F0` | Blanc crème — texte principal, body, titres |
| `--text2` | `#EEDDB8` | Beige crème — `icon-btn`, `cat-label`, `chip`, `cart-total-label` |
| `--text3` | `#A89070` | Texte tertiaire — nav items, placeholders, `no-results`, `auth-sub` |

### Couleurs RGB (pour rgba())

| Variable | RGB | Usage typique |
|---|---|---|
| `--primary-rgb` | `168,106,42` | `rgba(var(--primary-rgb), alpha)` — overlays, hover states |
| `--accent-rgb` | `184,132,47` | Hover accents |
| `--secondary-rgb` | `212,166,74` | Bordures, shadows gold, overlays (très utilisé) |
| `--success-rgb` | `58,157,94` | Badge dot on |
| `--danger-rgb` | `212,85,74` | Badge dot off, hover danger |
| `--muted-rgb` | `128,128,128` | Boutons annuler / fermer (gris neutre) |
| `--accent-red-rgb` | `177,18,23` | Overlays rouge hero |
| `--unavailable-rgb` | `109,11,15` | Badge indisponible |
| `--white-rgb` | `255,255,255` | `rgba(var(--white-rgb), alpha)` — overlays blancs, bordures |
| `--black-rgb` | `0,0,0` | `rgba(var(--black-rgb), alpha)` — overlays noirs, ombres |
| `--hero-bg-rgb` | `9,9,9` | `rgba(var(--hero-bg-rgb), alpha)` — dégradés hero |
| `--google-stars-rgb` | `255,184,0` | `rgba(var(--google-stars-rgb), alpha)` — Google stars glow |

### Couleurs spéciales

| Variable | Valeur | Usage |
|---|---|---|
| `--gradient-primary` | `135deg, #111111 → #A86A2A → #D4A64A` | Fond `btn-primary`, `wa-btn`, `cart-checkout`, `auth-btn` |
| `--gradient-accent` | `135deg, #D4A64A → #B8842F → #EEDDB8` | Accent décoratif (réservé) |
| `--gradient-dark` | `180deg, #111111 → #1E1208` | Fond section sombre (réservé) |
| `--accent-red` | `#B11217` | Cramoisi vif — hero, badge, admin-cta |
| `--unavailable` | `#6D0B0F` | Rouge foncé — badge indisponible |
| `--hero-bg` | `#090909` | Fond hero (plus sombre que `--bg`) |
| `--hero-gradient-start` | `#0c0909` | Début gradient hero |
| `--hero-gradient-end` | `#120a0a` | Fin gradient hero |
| `--google-stars` | `#FFB800` | Jaune officiel Google Avis |

### Statuts

| Variable | Valeur | Usage |
|---|---|---|
| `--success` | `#3A9D5E` | Vert — `.badge-dot.on` |
| `--danger` | `#D78873` | Saumon — `.cart-remove:hover`, `.auth-error`, `.admin-logout:hover` |
| `--warning` | `#D4A64A` | Identique à `--secondary` — alias sémantique |

---

## 2. Z-Index

| Variable | Valeur | Élément | Rôle |
|---|---|---|---|
| `--z-hero` | `0` | `.hero-bg` | Fond dégradé hero |
| `--z-hero-layer` | `1` | `.hero-video-overlay`, `.hero-pattern` | Overlays hero |
| `--z-hero-content` | `2` | `.hero-glow`, `.hero-content` | Contenu et lueurs hero |
| `--z-nav` | `100` | `.top-nav`, `.bottom-nav` | Barres de navigation fixed |
| `--z-cart` | `200` | `.cart-overlay` | Overlay semi-transparent panier |
| `--z-cart-panel` | `201` | `.cart-sidebar` | Panier latéral |
| `--z-toast` | `300` | `.toast` | Notifications temporaires |
| `--z-overlay` | `500` | `.auth-overlay`, `.admin-modal-overlay` | Overlays modaux |
| `--z-modal` | `600` | `.auth-modal`, `.admin-modal` | Modaux |
| `--z-snack` | `999` | `.aindalia-modal-overlay` | Modaux de confirmation (au-dessus de tout) |

---

## 3. Typographie

### Font families

| Variable | Valeur | Usage |
|---|---|---|
| `--font-body` | `'Inter', sans-serif` | Texte principal et UI |
| `--font-heading` | `'Playfair Display', serif` | Titres premium |
| `--font-accent` | `'Cormorant Garamond', serif` | `.hero-subtitle` uniquement |
| `--font-arabic` | `'Tajawal', 'Noto Naskh Arabic', sans-serif` | Mode RTL/arabe — corps |
| `--font-arabic-heading` | `'Tajawal', 'Noto Naskh Arabic', serif` | Mode RTL/arabe — titres |
| `--font-arabic-full` | `'Tajawal', 'Noto Naskh Arabic', 'Inter', sans-serif` | Mode RTL/arabe — fallback complet |

### Font sizes

| Variable | px | rem | Usage typique |
|---|---|---|---|
| `--text-2xs` | `7px` | `0.4375rem` | `.logo-sub` uniquement |
| `--text-badge` | `9px` | `0.5625rem` | Badges catégorie / panier |
| `--text-micro` | `10px` | `0.625rem` | Admin dense |
| `--text-tiny` | `11px` | `0.6875rem` | Admin dense, `.lang-btn` |
| `--text-xs` | `12px` | `0.75rem` | Nav items, `btn-primary`, `cat-label`, `chip` |
| `--text-tight` | `13px` | `0.8125rem` | Inputs admin |
| `--text-sm` | `14px` | `0.875rem` | Corps secondaire, `cart-checkout`, `auth-sub` |
| `--text-base` | `16px` | `1rem` | Texte de base |
| `--text-lg` | `18px` | `1.125rem` | `.dish-name`, `.contact-info h3` |
| `--text-xl` | `20px` | `1.25rem` | `.cart-title`, `.auth-title`, `.aindalia-modal-title` |
| `--text-2xl` | `24px` | `1.5rem` | `.dish-price`, `.auth-title` |
| `--text-score` | `28px` | `1.75rem` | `.google-review-score` uniquement |
| `--text-3xl` | `32px` | `2rem` | `.cart-total-amount`, `.section-title` |

### Font weights

| Variable | Valeur | Usage typique |
|---|---|---|
| `--fw-light` | `300` | Texte léger, `.hero-subtitle` |
| `--fw-regular` | `400` | Texte courant |
| `--fw-medium` | `500` | Nav items, catégorie labels, chips |
| `--fw-semibold` | `600` | Boutons, titres, `.dish-name` |
| `--fw-bold` | `700` | Titres hero, `.dish-price`, `.google-review-score` |

### Line heights

| Variable | Valeur | Usage typique |
|---|---|---|
| `--lh-tight` | `1.15` | Titres hero, `.section-title` |
| `--lh-snug` | `1.2` | `.google-review-score` |
| `--lh-normal` | `1.25` | `.hero-title` |
| `--lh-relaxed` | `1.5` | Texte courant |
| `--lh-loose` | `1.6` | `.aindalia-modal-message`, `.contact-info` |
| `--lh-looser` | `1.7` | `.hero-tagline` |

### Letter spacings

| Variable | Valeur | Usage typique |
|---|---|---|
| `--ls-tighter` | `0.03em` | `.chip` |
| `--ls-tight` | `0.04em` | `.nav-item span`, `.hero-title` |
| `--ls-normal` | `0.05em` | Texte général, `.hero-tagline` |
| `--ls-wide` | `0.06em` | `.section-title`, `.wa-btn` |
| `--ls-wider` | `0.08em` | `.auth-btn` |
| `--ls-widest` | `0.1em` | `.cat-label`, `.cart-checkout`, admin `th` |
| `--ls-mega` | `0.12em` | Desktop nav, badge, sidebar header |
| `--ls-ultra` | `0.2em` | `.btn-primary` |
| `--ls-max` | `0.3em` | `.logo-sub`, `.hero-subtitle`, admin sidebar header `span` |
| `--ls-extreme` | `0.35em` | `.section-eyebrow` |
| `--ls-super` | `0.4em` | `.hero-eyebrow` |

---

## 4. Espacements

| Variable | Valeur | Usage typique |
|---|---|---|
| `--space-xs` | `4px` | Gap minimal, marges serrées |
| `--space-2xs` | `6px` | Gap intermédiaire (comble le trou entre 4px et 8px) |
| `--space-sm` | `8px` | Padding inputs, gaps, marges |
| `--space-md` | `16px` | Padding cartes, marges sections |
| `--space-lg` | `24px` | Padding sections, gaps vues admin |
| `--space-xl` | `32px` | Padding page desktop |
| `--space-2xl` | `48px` | Grands écarts entre sections |
| `--space-3xl` | `64px` | Padding sections hero desktop |

---

## 5. Border Radius

| Variable | Valeur | Usage typique |
|---|---|---|
| `--radius-xs` | `6px` | `.admin-btn-add`, inputs admin |
| `--radius-sm` | `8px` | `.lang-btn`, éléments compacts |
| `--radius-md` | `12px` | Cartes, `.auth-modal`, toast |
| `--radius-lg` | `20px` | `.cat-card`, `.dish-card`, `.contact-card` |
| `--radius-full` | `9999px` | `.btn-primary`, `.chip`, `.wa-btn`, `.icon-btn` |

---

## 6. Box Shadows

| Variable | Valeur | Usage |
|---|---|---|
| `--shadow-review-card` | `0 8px 40px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)` | `.google-review-block` hover |
| `--shadow-cart-panel` | `8px 0 48px rgba(0,0,0,0.5)` | Panier latéral direction LTR |
| `--shadow-cart-panel-rtl` | `-8px 0 48px rgba(0,0,0,0.5)` | Panier latéral direction RTL |

---

## 7. Transitions

| Variable | Valeur | Usage typique |
|---|---|---|
| `--transition-instant` | `all 0.2s ease` | Hover éléments UI (9 composants) |
| `--transition-fast` | `all 0.3s ease` | Transitions par défaut (14 composants) |
| `--transition-normal` | `all 0.4s ease` | Cartes, overlay, fermeture panier (3 composants) |
| `--transition-micro` | `all 0.25s ease` | `.lang-btn` |
| `--transition-smooth` | `all 0.35s ease` | `.google-review-btn` |
| `--transition-panel` | `all 0.4s cubic-bezier(0.4,0,0.2,1)` | `.cat-card` |

---

## 8. Règles d'utilisation

- **Toujours** utiliser `var(--nom-variable)` dans le CSS
- **Ne jamais** hardcoder une couleur, taille, ou z-index
- Pour les `rgba()` : utiliser `rgba(var(--couleur-rgb), alpha)`
- Pour modifier une valeur globale : changer uniquement dans `variables.css`
- Les variables backward-compat (`--gold`, `--fire-orange`, etc.) existent pour compatibilité JS — ne pas utiliser dans le CSS
- Les animations `@keyframes` sont dans `variables.css` après la fermeture de `:root`
- L'import se fait via `main.css` : `@import url('variables.css')`

---

## 9. Variables ambiguës — attention

| Variable | Explication |
|---|---|
| `--space-2xs` | Vaut **6px** > `--space-xs` (4px) malgré le nom. Comble un trou entre 4px et 8px. |
| `--text-2xs` | Uniquement utilisée par `.logo-sub` (7px). Ne pas réutiliser sans justification. |
| `--text-score` | Uniquement utilisée par `.google-review-score` (28px). Valeur spécifique Google. |
| `--warning` | Identique à `--secondary` (`#D4A64A`). Alias sémantique conservé pour les API status. |
| `--ls-mega` | `0.12em` — nom arbitraire. Voir la doc letter-spacing pour l'usage exact. |
| `--ls-ultra` | `0.2em` — nom arbitraire. Uniquement `.btn-primary`. |
| `--ls-max` | `0.3em` — nom arbitraire. `.logo-sub`, `.hero-subtitle`, admin sidebar header `span`. |
| `--ls-extreme` | `0.35em` — nom arbitraire. Uniquement `.section-eyebrow`. |
| `--ls-super` | `0.4em` — nom arbitraire. Uniquement `.hero-eyebrow`. |

---

## 10. Historique des chantiers

| Date | Chantier | Remplacements | Variables ajoutées |
|---|---|---|---|
| 2026-06-24 | Couleurs rgba hardcodées | 72 | 12 |
| 2026-06-24 | Z-index | 15 | 10 |
| 2026-06-24 | Typographies | 150 | 30 |
| 2026-06-24 | Espacements & radius | ~35 | 2 |
| 2026-06-24 | Transitions | 26 | 3 |
| 2026-06-24 | White, noir, hero-bg — tokenisation finale | ~47 | 11 |
| **Total** | | **~345** | **68** |
