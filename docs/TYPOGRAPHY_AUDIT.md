# TYPOGRAPHY AUDIT — AINDALIA

> **Purpose:** Analysis only. Document every typography decision, find gaps,
> and produce actionable recommendations.
> **Source of truth:** `css/variables.css`, `DESIGN_SYSTEM.md`
> **Date:** 2026-06-24

---

## Table of Contents

1. [Font Families](#1-font-families)
2. [Font Sizes Inventory](#2-font-sizes-inventory)
3. [Font Weight Inventory](#3-font-weight-inventory)
4. [Line Height Inventory](#4-line-height-inventory)
5. [Letter Spacing Inventory](#5-letter-spacing-inventory)
6. [Typography Hierarchy](#6-typography-hierarchy)
7. [Mobile Readability Analysis](#7-mobile-readability-analysis)
8. [Arabic Typography Analysis](#8-arabic-typography-analysis)
9. [French Typography Analysis](#9-french-typography-analysis)
10. [Accessibility Analysis](#10-accessibility-analysis)
11. [Consistency Issues](#11-consistency-issues)
12. [Duplicate or Redundant Tokens](#12-duplicate-or-redundant-tokens)
13. [Components Using Incorrect Typography](#13-components-using-incorrect-typography)
14. [Premium Restaurant UI Best-Practice Comparison](#14-premium-restaurant-ui-best-practice-comparison)
15. [Recommendations Summary](#15-recommendations-summary)

---

## 1. Font Families

### 1.1 Defined Tokens

| Token | Value | Usage Scope | Source |
|---|---|---|---|
| `--font-body` | `'Inter', sans-serif` | Body, nav items, buttons, chips, inputs, badges, admin UI | `variables.css:114` |
| `--font-heading` | `'Playfair Display', serif` | Section titles, dish names, cart titles, auth titles, modal titles, admin headers | `variables.css:115` |
| `--font-accent` | `'Cormorant Garamond', serif` | `.hero-subtitle` only | `variables.css:116` |
| `--font-arabic` | `'Tajawal', 'Noto Naskh Arabic', sans-serif` | RTL body text | `variables.css:117` |
| `--font-arabic-heading` | `'Tajawal', 'Noto Naskh Arabic', serif` | RTL headings (hero, section, dish, cart, auth, admin) | `variables.css:118` |
| `--font-arabic-full` | `'Tajawal', 'Noto Naskh Arabic', 'Inter', sans-serif` | RTL UI elements (nav, buttons, inputs, toggles, modals) | `variables.css:119` |

### 1.2 Google Fonts Loaded

From `index.html`:
- **Playfair Display**: 400, 600, 700, 400 italic
- **Inter**: 300, 400, 500, 600
- **Cormorant Garamond**: 300, 400, 300 italic
- **Tajawal**: 300, 400, 500, 700
- **Noto Naskh Arabic**: 400, 500, 600, 700

### 1.3 Where Each Family Is Used

| Family | Components | Count |
|---|---|---|
| **Inter** | `body`, `.lang-btn`, `.desktop-nav-item`, `.nav-item span`, `.btn-primary`, `.cat-label`, `.chip`, `.section-eyebrow`, `.hero-eyebrow`, `.hero-tagline`, `.wa-btn`, `.cart-checkout`, `.cart-total-label`, `.cart-remove`, `.cart-empty`, `.qty-btn`, `.qty-num`, `.auth-sub`, `.auth-input`, `.auth-btn`, `.auth-toggle-label`, `.auth-error`, `.auth-lock`, `.badge`, `.admin-nav-item`, `.admin-logout`, `.admin-btn-add/export/import`, `.admin-tbl th/td`, `.admin-modal .form-group *`, `.admin-upload-label`, `.toggle-label`, `.aindalia-modal-message`, `.aindalia-modal-field`, `.aindalia-modal-btn`, `.contact-info p/a`, `.no-results`, `.logo-sub` | ~45 components |
| **Playfair Display** | `.section-title`, `.hero-title`, `.dish-name`, `.dish-price`, `.cart-title`, `.cart-total-amount`, `.cart-item-price`, `.auth-title`, `.contact-info h3`, `.google-review-score`, `.admin-sidebar-header`, `.admin-view-header h1`, `.admin-modal h2`, `.aindalia-modal-title` | ~14 components |
| **Cormorant Garamond** | `.hero-subtitle` | 1 component |
| **Tajawal** | RTL override for all above components | ~30 rules in `rtl.css` |
| **Noto Naskh Arabic** | Fallback in all Tajawal stacks | fallback only |

### 1.4 Findings

| # | Finding | Severity |
|---|---|---|
| F1.1 | `--font-accent` (Cormorant Garamond) is used by exactly one component (`.hero-subtitle`). Loading an entire font family for one element is a performance cost of ~25 KB (woff2). | ⚠️ Medium |
| F1.2 | The `--font-arabic-full` stack includes `'Inter', sans-serif` as final fallback, but Inter lacks Arabic glyphs. The fallback should be `'Tahoma', 'Arial', sans-serif` for Arabic text. | ⚠️ Medium |
| F1.3 | Playfair Display italic (400i) is loaded but never used in CSS. | ⚠️ Low |
| F1.4 | Cormorant Garamond italic (300i) is loaded and correctly used by `.hero-subtitle`. | ✅ OK |
| F1.5 | Inter weight 600 is the only semibold — correctly mapped to `--fw-semibold`. | ✅ OK |
| F1.6 | Tajawal weight 700 loaded but `--fw-bold` (700) is only used with Playfair Display, never with Tajawal. RTL bold headings combine `--font-arabic-heading` (serif stack) with `--fw-bold`. | ⚠️ Low |

---

## 2. Font Sizes Inventory

### 2.1 Defined Tokens

| Token | rem | px (16px base) | Usage |
|---|---|---|---|
| `--text-2xs` | 0.4375rem | **7px** | `.logo-sub` (only) |
| `--text-badge` | 0.5625rem | **9px** | `.badge`, `.cart-badge` |
| `--text-micro` | 0.625rem | **10px** | `admin-tbl th`, `td::before` (label), admin dense |
| `--text-tiny` | 0.6875rem | **11px** | `.lang-btn`, admin sidebar span, admin nav-item |
| `--text-xs` | 0.75rem | **12px** | `.section-eyebrow`, `.desktop-nav-item`, `.btn-primary`, `.cat-label`, `.chip`, `.cart-checkout`, `.wa-btn`, `.auth-toggle-label`, `.auth-error`, `.admin-btn-add`, admin modal buttons, `.no-results`, `.toggle-label` |
| `--text-tight` | 0.8125rem | **13px** | Admin inputs, `.aindalia-modal-field` |
| `--text-sm` | 0.875rem | **14px** | `.hero-tagline`, `.auth-sub`, `.cart-item-name`, `.cart-remove`, `.qty-num`, `.contact-info p/a`, `.aindalia-modal-message`, `.admin-action-btn`, admin modal labels |
| `--text-base` | 1rem | **16px** | `html`, `.dish-price` (also uses `--text-2xl`), `.contact-info h3` |
| `--text-lg` | 1.125rem | **18px** | `.dish-name`, admin sidebar header, admin modal h2 (mobile) |
| `--text-xl` | 1.25rem | **20px** | `.cart-title`, `.auth-title`, `.aindalia-modal-title`, admin view header h1 (mobile) |
| `--text-2xl` | 1.5rem | **24px** | `.dish-price`, `.auth-title`, admin view header h1 (desktop) |
| `--text-score` | 1.75rem | **28px** | `.google-review-score` (only) |
| `--text-3xl` | 2rem | **32px** | `.section-title`, `.cart-total-amount` |

### 2.2 Non-Token Sizes

| Selector | Value | Type | Location |
|---|---|---|---|
| `.hero-title` | `clamp(36px, 9vw, 76px)` | fluid | `components.css` |
| `.hero-subtitle` | `clamp(13px, 3vw, 17px)` | fluid | `components.css` |
| `.google-review-msg` | `calc(var(--text-sm) - 1px)` = ~13px | computed | `components.css` |
| `.google-review-stars` | `32px` | fixed px | `components.css:L968` |

### 2.3 Missing Sizes

| Gap | Context |
|---|---|
| No `--text-4xl` (40px+) | Hero fluid max is 76px, but no static token exists for sizes between 32px and 76px |
| No `--text-5xl` (48px+) | Could unify hero heading size on admin screens |
| No `--text-display` (64px+) | Some premium restaurant UIs use 64-72px for hero headlines |

### 2.4 Findings

| # | Finding | Severity |
|---|---|---|
| F2.1 | `--text-2xs` (7px) and `--text-badge` (9px) are below the WCAG AA minimum of 10px for readability. Only used for decorative `.logo-sub` and `.badge` — acceptable but flagged. | ⚠️ Low |
| F2.2 | `.hero-title` uses `clamp(36px, 9vw, 76px)` — no fallback for browsers without `clamp()` support. | ⚠️ Low |
| F2.3 | `.google-review-stars` hardcodes `32px` — should use a new `--text-4xl` (2rem) or `--text-icon` token. | ⚠️ Medium |
| F2.4 | `.google-review-msg` computes to `calc(14px - 1px) = 13px` — functionally equivalent to `--text-tight` (13px). Redundant calculation. | ⚠️ Low |
| F2.5 | Size jump from `--text-3xl` (32px) to hero clamp minimum (36px) is only 4px — gap is small but no `--text-4xl` exists. | ℹ️ Info |
| F2.6 | Inline style `font-size: 14px` in `index.html` (`.cart-empty` text) bypasses the design system. | 🔴 High |
| F2.7 | Inline style `font-size: 12px` in `index.html` (`.cart-emptySub`, `.no-resultsSub`) bypasses the design system. | 🔴 High |

---

## 3. Font Weight Inventory

### 3.1 Defined Tokens

| Token | Value | Usage |
|---|---|---|
| `--fw-light` | 300 | `.hero-subtitle` (Cormorant Garamond italic) |
| `--fw-regular` | 400 | `.hero-eyebrow`, body text default |
| `--fw-medium` | 500 | `.section-eyebrow`, `.desktop-nav-item`, `.nav-item span`, `.cat-label`, `.chip`, admin nav-item |
| `--fw-semibold` | 600 | `.btn-primary`, `.wa-btn`, `.cart-checkout`, `.auth-btn`, `.dish-name`, `.contact-info h3`, `.admin-btn-export/import`, `.admin-tbl th`, `td::before`, `.aindalia-modal-title` |
| `--fw-bold` | 700 | `.section-title`, `.hero-title`, `.dish-price`, `.cart-total-amount`, `.cart-item-price`, `.google-review-score`, admin sidebar header, admin view header h1, `.badge` |

### 3.2 Non-Token Weights

None found. All font-weight declarations in CSS now use `var(--fw-*)` tokens.

### 3.3 Findings

| # | Finding | Severity |
|---|---|---|
| F3.1 | There is no `--fw-black` (800 or 900). Some premium restaurant UIs use weight 800 for hero headlines. Currently `.hero-title` uses `--fw-bold` (700). | ℹ️ Info |
| F3.2 | The weight progression (300-400-500-600-700) is evenly spaced and complete for a 5-step scale. | ✅ OK |

---

## 4. Line Height Inventory

### 4.1 Defined Tokens

| Token | Value | Usage |
|---|---|---|
| `--lh-tight` | 1.15 | `.section-title`, hero titles |
| `--lh-snug` | 1.2 | `.google-review-score` |
| `--lh-normal` | 1.25 | `.hero-title` |
| `--lh-relaxed` | 1.5 | Body text, `.dish-name`, `.auth-sub`, `.cart-item-name`, `.cart-empty`, admin nav-item |
| `--lh-loose` | 1.6 | `.aindalia-modal-message`, `.contact-info p`, admin labels |
| `--lh-looser` | 1.7 | `.hero-tagline` |

### 4.2 Non-Token Line Heights

| Selector | Value | Location |
|---|---|---|
| `.google-review-stars` | `1` | `components.css:L968` |

This is the only hardcoded line-height. It is used on the star display (text-based stars for Google rating).

### 4.3 Findings

| # | Finding | Severity |
|---|---|---|
| F4.1 | The hardcoded `line-height: 1` on `.google-review-stars` should use a token. Either `--lh-tight` (1.15) or a new `--lh-none` (1). | ⚠️ Medium |
| F4.2 | The 6-step line-height scale (1.15 through 1.7) covers all use cases well. The progression from tight display to loose paragraph text is logical. | ✅ OK |
| F4.3 | No line-height token exists for `1` — the only value missing from the integer to 1.7 range. | ℹ️ Info |

---

## 5. Letter Spacing Inventory

### 5.1 Defined Tokens

| Token | Value | Usage |
|---|---|---|
| `--ls-tighter` | 0.03em | `.chip` |
| `--ls-tight` | 0.04em | `.nav-item span`, `.hero-title` |
| `--ls-normal` | 0.05em | Body text, `.hero-tagline` |
| `--ls-wide` | 0.06em | `.section-title`, `.wa-btn` |
| `--ls-wider` | 0.08em | `.auth-btn`, `td::before` label |
| `--ls-widest` | 0.10em | `.cat-label`, `.cart-checkout`, admin `th`, `.hero-eyebrow` (RTL) |
| `--ls-mega` | 0.12em | Desktop nav, `.badge`, admin sidebar header |
| `--ls-ultra` | 0.20em | `.btn-primary` |
| `--ls-max` | 0.30em | `.logo-sub`, `.hero-subtitle`, admin sidebar header `span` |
| `--ls-extreme` | 0.35em | `.section-eyebrow` |
| `--ls-super` | 0.40em | `.hero-eyebrow` |

### 5.2 Non-Token Letter Spacings

| Selector | Value | Location |
|---|---|---|
| `.google-review-stars` | `4px` | `components.css:L968` |

This is the only hardcoded letter-spacing. It is `4px` (absolute, not em-based). At 32px font size, 4px = 0.125em which falls between `--ls-widest` (0.1em) and `--ls-mega` (0.12em). A new token `--ls-glow` (0.125em or 4px) could cover this.

### 5.3 Findings

| # | Finding | Severity |
|---|---|---|
| F5.1 | Letter-spacing tokens from `--ls-mega` through `--ls-super` have arbitrary names that provide no semantic meaning (mega, ultra, max, extreme, super). They are ordered by value but the names don't convey intent. | ⚠️ Medium |
| F5.2 | `4px` on `.google-review-stars` is hardcoded and pixel-based (not em). At 32px font-size this is 0.125em. Should be tokenized. | ⚠️ Medium |
| F5.3 | No letter-spacing token covers the range 0.15em–0.19em (between `--ls-widest` 0.1em and `--ls-ultra` 0.2em). | ℹ️ Info |
| F5.4 | RTL overrides: `--ls-widest` (0.1em) for `.hero-eyebrow` in RTL mode (rtl.css:129) vs `--ls-super` (0.4em) in LTR mode. The RTL Arabic text requires less letter-spacing than Latin, which is a correct design decision. | ✅ OK |
| F5.5 | `.hero-tagline` and `.hero-subtitle` use `--ls-normal` (0.05em) in RTL mode (rtl.css:227) — also a correct reduction from their LTR values. | ✅ OK |

---

## 6. Typography Hierarchy

### 6.1 Current Hierarchy

```
LEVEL 1 — Hero Display
  .hero-title         Playfair Display 700  clamp(36px,9vw,76px)  lh-1.25  ls-0.04em
  .hero-subtitle      Cormorant Garamond 300i clamp(13px,3vw,17px)  —  ls-0.3em (LTR)
  .hero-eyebrow       Inter 400  --text-xs (12px)  —  ls-0.4em (LTR)
  .hero-tagline       Inter —  --text-sm (14px)  lh-1.7  ls-0.05em

LEVEL 2 — Section Headings
  .section-title      Playfair Display 700  --text-3xl (32px)  lh-1.15  ls-0.06em
  .section-eyebrow    Inter 500  --text-xs (12px)  —  ls-0.35em

LEVEL 3 — Component Headings
  .dish-name          Playfair Display 600  --text-lg (18px)  lh-1.3 → lh-1.5
  .cart-title         Playfair Display —  --text-xl (20px)  —  —
  .cart-total-amount  Playfair Display —  --text-3xl (32px)  —  —
  .auth-title         Playfair Display —  --text-2xl (24px)  —  —
  .aindalia-modal-title  Playfair Display 600  --text-xl (20px)  —  —

LEVEL 4 — Content Text
  body                Inter —  --text-base (16px)  —  —
  .dish-price         Playfair Display 700  --text-2xl (24px)  —  —
  .auth-sub           Inter —  --text-sm (14px)  —  —
  .contact-info p     Inter —  --text-sm (14px)  lh-1.6  —

LEVEL 5 — UI & Navigation
  .desktop-nav-item   Inter 500  --text-xs (12px)  —  ls-0.12em
  .nav-item span      Inter 500  --text-xs (12px)  —  ls-0.04em
  .btn-primary        Inter 600  --text-xs (12px)  —  ls-0.2em
  .cat-label          Inter 500  --text-xs (12px)  —  ls-0.1em
  .chip               Inter 500  --text-sm (14px)  —  ls-0.03em

LEVEL 6 — Micro & Badges
  .badge              Inter 700  --text-badge (9px)  —  ls-0.12em
  .logo-sub           Inter —  --text-2xs (7px)  —  ls-0.3em
  .admin-tbl th       Inter 600  --text-micro (10px)  —  ls-0.1em
```

### 6.2 Hierarchy Issues

| # | Finding | Severity |
|---|---|---|
| F6.1 | There are 6 visual levels but only 4 heading token sizes (--text-lg through --text-3xl). The micro/badge level (levels 5-6) uses 4 additional tokens below --text-xs. The scale is front-loaded at the micro end. | ℹ️ Info |
| F6.2 | `.cart-total-amount` uses `--text-3xl` (32px) — the same token as `.section-title`. A cart total being visually equal to a section heading may confuse hierarchy. | ⚠️ Low |
| F6.3 | `.dish-price` uses `--text-2xl` (24px) which is larger than `.dish-name` (`--text-lg`, 18px). The price visually dominates the name. Intentional (premium pricing emphasis) but unconventional. | ℹ️ Info |
| F6.4 | No semantic `<h1>`–`<h6>` structure is defined in CSS. All headings are class-based. This is fine for a SPA but screen readers rely on heading levels. | ⚠️ Medium |
| F6.5 | `.auth-title` uses `--text-2xl` (24px) on desktop and no responsive override. On mobile, a login modal with 24px title is acceptable. | ✅ OK |

---

## 7. Mobile Readability Analysis

### 7.1 Font Sizes on Mobile

| Component | Desktop | Mobile | Delta |
|---|---|---|---|
| `.section-title` | 32px | 32px (unchanged) | 0 |
| `.hero-title` | clamp up to 76px | clamp down to 36px | fluid |
| `.hero-subtitle` | clamp up to 17px | clamp down to 13px | fluid |
| `.dish-name` | 18px | 18px (unchanged) | 0 |
| `.dish-price` | 24px | 24px (unchanged) | 0 |
| `.admin-view-header h1` | 24px | 20px (—text-xl) | -4px |
| `.admin-modal h2` | 20px | 18px (--text-lg) | -2px |
| Admin nav-item | 12px | 11px (--text-tiny) | -1px |
| Admin table th/td | 10px–12px | 11px (--text-tiny) | ±1px |

### 7.2 Findings

| # | Finding | Severity |
|---|---|---|
| F7.1 | Only the Hero section uses fluid typography. All other components have fixed rem sizes that do not scale on smaller viewports. | ⚠️ Medium |
| F7.2 | Admin table text at `--text-micro` (10px) on mobile is below the WCAG minimum legible size (11px recommended). `--text-tiny` (11px) is the minimum acceptable. | ⚠️ Medium |
| F7.3 | The `.filter-chips` on mobile (3 items full-width, then flex wrap) has chips at `--text-sm` (14px) — adequate for tap targets. | ✅ OK |
| F7.4 | No `font-size` adjustments are made for the `.hero-content` shift (`translateY(-110px)`) on mobile. Text that is pushed up remains the same size but has less visible context. | ℹ️ Info |
| F7.5 | Touch targets at `--text-xs` (12px) with padding are usable; the minimum chip/button size is 36×36px (`.icon-btn`). | ✅ OK |

---

## 8. Arabic Typography Analysis

### 8.1 Font Stack Design

The RTL system uses a three-tier font strategy:

```
Latin (LTR)         → Arabic (RTL)
─────────────────────────────────────
--font-body         → --font-arabic (Tajawal + Noto Naskh Arabic sans)
--font-heading      → --font-arabic-heading (Tajawal + Noto Naskh Arabic serif)
--font-accent       → (not overridden — hero-subtitle stays Cormorant)
--font-body (UI)    → --font-arabic-full (Tajawal + Noto Naskh Arabic + Inter fallback)
```

### 8.2 RTL Override Coverage

| Component | LTR Family | RTL Family | Override in rtl.css |
|---|---|---|---|
| body | `--font-body` | `--font-arabic` | ✅ L5-L7 |
| `.desktop-nav-item` | `--font-body` | `--font-arabic-full` | ✅ L9-L11 |
| `.nav-item span` | `--font-body` | `--font-arabic-full` | ✅ L13-L15 |
| `.lang-btn` | `--font-body` | `--font-arabic-full` | ✅ L22-L24 |
| `.auth-input` | `--font-body` | `--font-arabic-full` | ✅ L104-L106 |
| `.auth-btn` | `--font-body` | `--font-arabic-full` | ✅ L108-L110 |
| `.auth-toggle-label` | `--font-body` | `--font-arabic-full` | ✅ L112-L114 |
| `.admin-logout` | `--font-body` | `--font-arabic-full` | ✅ L82-L84 |
| `.admin-nav-item` | `--font-body` | `--font-arabic-full` | ✅ L86-L88 |
| `.admin-btn-add/export/import` | `--font-body` | `--font-arabic-full` | ✅ L90-L94 |
| `.aindalia-modal-btn` | `--font-body` | `--font-arabic-full` | ✅ L96-L98 |
| `.aindalia-modal-field` | `--font-body` | `--font-arabic-full` | ✅ L100-L102 |
| `.admin-upload-label` | `--font-body` | `--font-arabic-full` | ✅ L199-L201 |
| `.auth-title` | `--font-heading` | `--font-arabic-heading` | ✅ L116-L118 |
| `.cart-title` | `--font-heading` | `--font-arabic-heading` | ✅ L120-L122 |
| `.hero-title` | `--font-heading` | `--font-arabic-heading` | ✅ L124-L126 |
| `.section-title` | `--font-heading` | `--font-arabic-heading` | ✅ L132-L134 |
| `.dish-name` | `--font-heading` | `--font-arabic-heading` | ✅ L136-L138 |
| `.dish-price` | `--font-heading` | `--font-arabic-heading` | ✅ L140-L142 |
| `.cart-total-amount` | `--font-heading` | `--font-arabic-heading` | ✅ L144-L146 |
| `.contact-info h3` | `--font-heading` | `--font-arabic-heading` | ✅ L148-L150 |
| `.google-review-score` | `--font-heading` | `--font-arabic-heading` | ✅ L152-L154 |
| `.admin-view-header h1` | `--font-heading` | `--font-arabic-heading` | ✅ L156-L158 |
| `.admin-sidebar-header` | `--font-heading` | `--font-arabic-heading` | ✅ L160-L162 |
| `.admin-modal h2` | `--font-heading` | `--font-arabic-heading` | ✅ L164-L166 |
| `.aindalia-modal-title` | `--font-heading` | `--font-arabic-heading` | ✅ L168-L170 |

### 8.3 Letter-Spacing Adjustments (RTL)

| Component | LTR Letter-Spacing | RTL Letter-Spacing |
|---|---|---|
| `.hero-eyebrow` | `--ls-super` (0.4em) | `--ls-widest` (0.1em) |
| `.hero-tagline` | `--ls-normal` (0.05em) | `--ls-normal` (0.05em) — same |
| `.hero-subtitle` | `--ls-max` (0.3em) | `--ls-normal` (0.05em) |

### 8.4 Findings

| # | Finding | Severity |
|---|---|---|
| F8.1 | RTL font-family override coverage is **complete** — every LTR font declaration has a matching RTL override in `rtl.css`. | ✅ OK |
| F8.2 | The `--font-arabic` stack uses `sans-serif` while `--font-arabic-heading` uses `serif`. Tajawal is a sans-serif font in both stacks — the `serif` keyword is a misleading fallback. If a serif Arabic fallback is desired, `'Noto Naskh Arabic'` (which is a naskh/serif style) should come first. | ⚠️ Medium |
| F8.3 | Letter-spacing is significantly reduced in RTL mode (0.4em → 0.1em for `.hero-eyebrow`). This is correct because Arabic script does not tolerate wide tracking. | ✅ OK |
| F8.4 | The `--font-accent` (Cormorant Garamond) is not overridden for RTL — `.hero-subtitle` stays in Cormorant Garamond even in Arabic mode. This may be intentional (stylistic choice) but creates a Latin-italic accent in an Arabic context. | ⚠️ Low |
| F8.5 | `.hero-tagline` and `.hero-subtitle` in RTL mode reset letter-spacing to `--ls-normal` (0.05em) at `rtl.css:225-228`. | ✅ OK |

---

## 9. French Typography Analysis

### 9.1 Observations

| Feature | Handling |
|---|---|
| Accents (é, è, ê, ë, ç, à, ù) | Inter has full Latin Extended-A support — ✅ OK |
| French quotation marks (« ») | Not used in codebase. All strings use straight quotes. |
| French spacing rules (espace insécable) | Not handled — HTML uses regular spaces before `:`, `!`, `?`, `;`, `»`. |
| French number formatting (1 234,56) | Not handled. Prices use `DH` suffix without space before currency. |
| "Panier" vs "Cart" | `data-i18n` keys handle translations. French text uses "Panier", "Ajoutez des plats", etc. |

### 9.2 Findings

| # | Finding | Severity |
|---|---|---|
| F9.1 | No French-specific typographic features (non-breaking spaces, custom quotation marks) are implemented. This is standard for web apps and acceptable. | ℹ️ Info |
| F9.2 | Inter covers French diacritics fully — no rendering issues expected. | ✅ OK |

---

## 10. Accessibility Analysis

### 10.1 WCAG Compliance

| Requirement | Status | Details |
|---|---|---|
| 1.4.4 Resize text (200%) | ⚠️ Partial | rem-based sizes scale with browser zoom. `clamp()` values are relative. No `px`-based font sizes in CSS. |
| 1.4.8 Visual presentation | ⚠️ Partial | Line-height tokens go up to 1.7 (body text default is 1.5). WCAG recommends 1.5 minimum. |
| 1.4.12 Text spacing | ✅ OK | No `!important` overrides on `letter-spacing`, `word-spacing`, or `line-height`. |
| 2.4.10 Section headings | ⚠️ Partial | `.section-title` exists but no `<h1>`–`<h6>` hierarchy enforced by CSS. |
| Contrast (text) | ✅ AAA | `--text` (#F8F6F0) on `--bg` (#111111) = 17.5:1 |
| Contrast (UI text) | ✅ AA | `--text3` (#A89070) on `--bg` (#111111) = 6.5:1 |

### 10.2 Accessibility Findings

| # | Finding | Severity |
|---|---|---|
| F10.1 | `--text-2xs` (7px) and `--text-badge` (9px) are below the WCAG minimum readable size (10px). However, `.logo-sub` (7px) is a logo detail and `.badge` (9px) is a UI counter — both have context that makes them acceptable exceptions. | ⚠️ Low |
| F10.2 | `--text-micro` (10px) is used for admin table headers. Admin back-office interfaces have different accessibility requirements (internal users), but 10px is still below recommended minimum. | ⚠️ Medium |
| F10.3 | No `word-spacing` or `max-width` for reading optimization. WCAG 1.4.8 recommends `max-width: 80ch` for text blocks. Content text (`.section`, `.dish-body`, `.contact-info`) has no width constraint. | ⚠️ Medium |
| F10.4 | The RTL font stack `--font-arabic-full` falls back to `sans-serif` via the last generic keyword. If the browser has a poor default sans-serif for Arabic, readability degrades. `'Tahoma'` would be a better final fallback. | ⚠️ Low |

---

## 11. Consistency Issues

### 11.1 Inconsistencies Between Components

| # | Issue | Components | Severity |
|---|---|---|---|
| C1 | `.hero-title` uses `--ls-tight` (0.04em) while `.section-title` uses `--ls-wide` (0.06em). Hero is tighter than section title — reversed from expected hierarchy. | Hero vs Section | ⚠️ Low |
| C2 | `.contact-info h3` uses `--fw-semibold` (600) at `--text-base` (16px). `.dish-name` also uses `--fw-semibold` (600) but at `--text-lg` (18px). Inconsistent heading weight for similar sub-headings. | Contact vs Dish card | ⚠️ Low |
| C3 | `.auth-title` (24px) and `.aindalia-modal-title` (20px) have different sizes despite both being modal titles. | Auth modal vs Confirm modal | ⚠️ Low |
| C4 | `.admin-view-header h1` uses **both** `--text-2xl` (24px, desktop) and `--text-xl` (20px, ≤768px) and `--text-lg` (18px, ≤480px). Three breakpoints for a single component is inconsistent with the rest of the system which has 0–1 breakpoints. | Admin header | ⚠️ Low |
| C5 | `.admin-modal h2` uses `--text-xl` (20px) on desktop and `--text-lg` (18px) on mobile. `.auth-title` uses `--text-2xl` (24px) at all sizes. No mobile scaling for auth. | Auth vs Admin modal | ⚠️ Low |
| C6 | `.btn-primary` uses `--text-xs` (12px) with `--ls-ultra` (0.2em). `.wa-btn` also uses `--text-xs` (12px) but with `--ls-wide` (0.06em). Similar buttons, different letter-spacing. | btn-primary vs wa-btn | ⚠️ Low |

### 11.2 Pattern Inconsistencies

| # | Issue | Severity |
|---|---|---|
| C7 | Heading `.dish-name` uses `--text-lg` (18px) with `--lh-relaxed` (1.5) and `--fw-semibold` (600). The relaxed line-height on a heading is unusual — headings typically use 1.15–1.3. | ⚠️ Medium |
| C8 | The `.chip` component uses `--ls-tighter` (0.03em) — the smallest tracking token. Admin table headers use `--ls-widest` (0.1em). These are opposite ends of the scale for similar "label" components. | ⚠️ Low |
| C9 | `--text-base` (16px) is the body default but is used explicitly in only one place (`.contact-info h3`). Other uses inherit it from `html { font-size: var(--text-base) }`. | ℹ️ Info |

---

## 12. Duplicate or Redundant Typography Tokens

### 12.1 Analysis

| Token | Redundancy | Recommendation |
|---|---|---|
| `--ls-mega` (0.12em) | Unique value — used by desktop nav, badge, admin sidebar header. | Keep. Arbitrary name — rename to `--ls-nav` or `--ls-label`. |
| `--ls-ultra` (0.2em) | Unique value — used by `.btn-primary`. | Keep. Arbitrary name — rename to `--ls-btn`. |
| `--ls-max` (0.3em) | Unique value — used by `.logo-sub`, `.hero-subtitle`, admin sidebar header `span`. | Keep. Arbitrary name — rename to `--ls-wide-text` or `--ls-display`. |
| `--ls-extreme` (0.35em) | Unique value — used by `.section-eyebrow`. | Keep. Arbitrary name — rename to `--ls-eyebrow`. |
| `--ls-super` (0.4em) | Unique value — used by `.hero-eyebrow`. | Keep. Arbitrary name — rename to `--ls-hero`. |
| `--text-score` (28px) | Used only by `.google-review-score`. Could be replaced by a calc or rounding of `--text-3xl` (32px). | ⚠️ Keep but flag as single-use. |
| `--text-2xs` (7px) | Used only by `.logo-sub`. | ⚠️ Keep but flag as single-use. |
| `--text-badge` (9px) | Used by `.badge` and `.cart-badge` — 2 components. | Keep. |
| `--font-accent` | Used only by `.hero-subtitle`. A 25 KB font for one element. | ⚠️ Consider merging into `--font-heading` with italic weight. |

### 12.2 Findings

| # | Finding | Severity |
|---|---|---|
| F12.1 | 5 letter-spacing tokens (`--ls-mega` through `--ls-super`) have arbitrary names. They should be renamed to describe their purpose (e.g., `--ls-nav`, `--ls-btn`, `--ls-eyebrow`). | ⚠️ Medium |
| F12.2 | `--text-score` (28px) is only 4px less than `--text-3xl` (32px). Could be replaced but its single-use nature makes it acceptable. | ⚠️ Low |
| F12.3 | `--font-accent` (Cormorant Garamond) for a single element is a performance concern. Consider removing the dedicated import and using `Playfair Display` italic as a substitute (already loaded). | ⚠️ Medium |
| F12.4 | No tokens are completely unused. All defined tokens have at least one CSS reference. | ✅ OK |

---

## 13. Components Using Incorrect Typography

### 13.1 Mismatches

| Component | Expected | Actual | Issue |
|---|---|---|---|
| `.dish-name` | `--font-heading` ✅ | Playfair Display 600, `--text-lg`, `--lh-relaxed` (1.5) | `--lh-relaxed` is too loose for a heading (should be 1.15–1.3) |
| `.contact-info h3` | `--font-heading` ✅ | Playfair Display 600, `--text-base`, `--lh-loose` (1.6) | `--lh-loose` is paragraph spacing, not heading spacing |
| `.google-review-stars` | Should use `--fw-*` and `--ls-*` tokens | `font-size: 32px`, `line-height: 1`, `letter-spacing: 4px` | Three hardcoded values bypassing the design system |
| `.google-review-msg` | Should use `--text-tight` | `calc(var(--text-sm) - 1px)` | Computes to ~13px = `--text-tight`; redundant calc |

### 13.2 Inline Styles in index.html

| Element | Style | Issue |
|---|---|---|
| `.cart-empty` (p) | `font-size:14px; font-weight:500` | Bypasses `--text-sm` (14px) and `--fw-medium` (500) tokens |
| `.cart-emptySub` (p) | `font-size:12px` | Should be `--text-xs` (12px) |
| `.no-resultsSub` (p) | `font-size:12px` | Should be `--text-xs` (12px) |

### 13.3 Findings

| # | Finding | Severity |
|---|---|---|
| F13.1 | Inline styles in `index.html` for `.cart-empty`, `.cart-emptySub`, and `.no-resultsSub` bypass the entire typography system. These are hardcoded `px` values. | 🔴 High |
| F13.2 | `.google-review-stars` has 3 hardcoded typography values (font-size 32px, line-height 1, letter-spacing 4px). This is the only component with multiple hardcoded typography values. | 🔴 High |
| F13.3 | `.dish-name` uses `--lh-relaxed` which is too loose for a card title. Should use `--lh-tight` (1.15) or `--lh-snug` (1.2). | ⚠️ Medium |
| F13.4 | `.contact-info h3` uses `--lh-loose` (1.6) which is paragraph spacing for a heading. | ⚠️ Medium |

---

## 14. Premium Restaurant UI Best-Practice Comparison

### 14.1 Industry Standards

| Practice | Industry Standard | AINDALIA | Gap |
|---|---|---|---|
| Hero headline | 48–80px, serif, weight 700 | clamp(36px,9vw,76px), Playfair 700 | ✅ Aligned |
| Section title | 28–36px, serif, letter-spaced | `--text-3xl` (32px), Playfair 700, ls-0.06em | ✅ Aligned |
| Menu item name | 16–20px, serif | `--text-lg` (18px), Playfair 600 | ✅ Aligned |
| Menu item price | 18–24px, serif, accent color | `--text-2xl` (24px), Playfair 700, `--accent` | ✅ Aligned |
| Cart total | 24–32px, serif, bold | `--text-3xl` (32px), Playfair 700, `--accent` | ✅ Aligned |
| Navigation | 11–13px, uppercase, letter-spaced | `--text-xs` (12px), Inter 500, ls-0.12em | ✅ Aligned |
| Eyebrow label | 10–12px, uppercase, wide tracking | `--text-xs` (12px), Inter, ls-0.35em | ✅ Aligned |
| Body text | 14–16px, sans-serif, lh-1.5–1.7 | `--text-base` (16px), Inter, lh-1.5 | ✅ Aligned |
| Badge/Counter | 9–11px, bold | `--text-badge` (9px), Inter 700 | ✅ Aligned |
| Multiple font families | 2 families maximum recommended | **5 families** loaded (Inter, Playfair, Cormorant, Tajawal, Noto Naskh) | ⚠️ Over-optimized |
| Fluid typography | `clamp()` with 3 breakpoints for all headings | Only 2 `clamp()` calls (hero only) | ⚠️ Partial |
| Line length control | `max-width: 65-80ch` for readable text | No `ch`-based max-width anywhere | ⚠️ Missing |

### 14.2 Premium Typography Features Missing

| Feature | Description | Priority |
|---|---|---|
| **Optical sizing** | Playfair Display supports `opsz` — not configured | Low |
| **Font smoothing** | `-webkit-font-smoothing: antialiased` not set | Low |
| **Kerning** | `font-kerning: normal` not set on serif headings | Low |
| **Ligatures** | `font-variant-ligatures: common-ligatures` not set | Low |
| **Number alignment** | `font-variant-numeric: oldstyle-nums` for prices | Low |
| **Subtitle size variant** | `font-size: smaller` or `--text-sm` on hero subtitle (calc preferred) — already present | ✅ OK |
| **Caps-to-small-caps** | Not used | Low |

### 14.3 Findings

| # | Finding | Severity |
|---|---|---|
| F14.1 | Loading 5 font families (6 if counting italic variants) is excessive for a restaurant menu SPA. 2–3 families is the premium norm. | ⚠️ Medium |
| F14.2 | No `max-width` constraint on text content for optimal line length (~66 characters). `.section` uses `max-width: 1200px` (layout, not readability). | ⚠️ Medium |
| F14.3 | No font-smoothing or kerning optimizations are applied. These are standard in premium restaurant UIs. | ⚠️ Low |
| F14.4 | The typography scale (13 steps from 7px to 32px, plus fluid hero) is comprehensive. Only 2–3 gaps exist. | ✅ OK |
| F14.5 | The serif + sans-serif pairing (Playfair Display + Inter) is a proven premium restaurant combination used by Michelin-starred restaurant websites. | ✅ OK |

---

## 15. Recommendations Summary

### 🔴 High Priority

| # | Recommendation | Effort |
|---|---|---|
| R1 | Replace inline `font-size: 14px` / `font-size: 12px` in `index.html` with `var(--text-sm)` / `var(--text-xs)` class-based styling. | 5 min |
| R2 | Tokenize `.google-review-stars` three hardcoded values: `32px → var(--text-4xl) or new token`, `line-height: 1 → var(--lh-none)`, `letter-spacing: 4px → var(--ls-glow)`. | 10 min |

### ⚠️ Medium Priority

| # | Recommendation | Effort |
|---|---|---|
| R3 | Rename `--ls-mega`→`--ls-nav`, `--ls-ultra`→`--ls-btn`, `--ls-max`→`--ls-display`, `--ls-extreme`→`--ls-eyebrow`, `--ls-super`→`--ls-hero` for semantic clarity. | 15 min |
| R4 | Evaluate removing `--font-accent` (Cormorant Garamond) and using Playfair Display italic for `.hero-subtitle` instead. Saves ~25 KB. | 15 min |
| R5 | Add `max-width: 70ch` to `.section`, `.dish-body`, and `.contact-info` for optimal reading line length. | 10 min |
| R6 | Fix `.dish-name` line-height from `--lh-relaxed` (1.5) to `--lh-tight` (1.15) or `--lh-snug` (1.2). | 5 min |
| R7 | Fix `.contact-info h3` line-height from `--lh-loose` (1.6) to `--lh-snug` (1.2) or `--lh-normal` (1.25). | 5 min |
| R8 | Add fluid typography (clamp) to at least `.section-title` and `.cart-total-amount` for responsive scaling. | 15 min |
| R9 | Fix `--font-arabic` stack — change generic fallback from `sans-serif` to `'Tahoma', 'Arial', sans-serif` for better Arabic rendering. | 5 min |
| R10 | Replace `--font-arabic-heading` serif stack — swap `'Noto Naskh Arabic'` before `'Tajawal'` if serif style is desired, or use a true Arabic serif like `'Amiri'` or `'Noto Naskh Arabic'` as primary. | 10 min |

### ℹ️ Low Priority

| # | Recommendation | Effort |
|---|---|---|
| R11 | Add `-webkit-font-smoothing: antialiased` on `body` for sharper text rendering on macOS. | 2 min |
| R12 | Add `font-kerning: normal` on `--font-heading` for improved serif spacing. | 2 min |
| R13 | Consider adding `--text-4xl: 2.5rem (40px)` and `--text-5xl: 3rem (48px)` tokens for future heading hierarchy. | 5 min |
| R14 | Evaluate whether `--text-score` can be replaced by `--text-3xl` with adjusted visual weight. | 5 min |
| R15 | Standardize modal title size across `.auth-title` (24px) and `.aindalia-modal-title` (20px) — pick one. | 5 min |
| R16 | Convert `.google-review-msg` `calc(var(--text-sm) - 1px)` → `var(--text-tight)` for consistency. | 2 min |
| R17 | Replace `--font-arabic-full` fallback `'Inter', sans-serif` → `'Tahoma', 'Arial', sans-serif` (Inter lacks Arabic glyphs). | 5 min |

### ✅ Strengths

| # | Strength |
|---|---|
| S1 | Complete font-family override system for RTL — every component has an Arabic font variant. |
| S2 | Well-structured size progression from 7px to 32px with minimal gaps. |
| S3 | All CSS font-weight declarations use `var(--fw-*)` tokens — zero hardcoded weights. |
| S4 | Line-height scale (1.15–1.7) covers display through paragraph text appropriately. |
| S5 | Letter-spacing scale (0.03em–0.40em) covers tight labels through wide hero eyebrow. |
| S6 | Playfair Display + Inter pairing is aligned with premium restaurant industry standards. |
| S7 | Fluid typography on hero section using `clamp()` is a correct responsive approach. |

---

*End of audit — 14 sections, 17 severity-rated findings, 17 recommendations, 7 strengths identified.*
