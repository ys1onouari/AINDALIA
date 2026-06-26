# PRODUCT CARD AUDIT — AINDALIA Digital Menu

> **Scope:** Complete codebase analysis of the product (dish) card system.
> **Date:** 2026-06-24
> **Auditor:** Automated codebase scan
> **Coverage:** 13 files reviewed across JS, CSS, HTML, JSON

---

## 1. Executive Summary

The product card system is functionally complete but has **6 critical**, **12 high**, **9 medium**, and **5 low** severity findings across architecture, UI, UX, accessibility, performance, code quality, security, and responsive design.

| Dimension | Score | Verdict |
|---|---|---|
| Architecture | 6/10 | Monolithic JS, no component model, no types |
| UI Design | 7/10 | Strong dark-gold theme, minor polish gaps |
| UX | 5/10 | Missing description, detail view, dietary info |
| Accessibility | 3/10 | WCAG failures: aria-labels, focus, font size, tap target |
| Performance | 6/10 | Missing lazy loading, inline SVG bloat, layout shifts |
| Code Quality | 5/10 | XSS vector, magic numbers, dead CSS, naming issues |
| Security | 4/10 | Unescaped template injection, CDN without SRI |
| Responsive | 6/10 | Grid adapts, but card has no responsive rules itself |
| **Overall** | **5.25/10** | **Functional but needs hardening before production** |

### Files in scope (13)

| File | Lines | Role |
|---|---|---|
| `js/menu.js` | 549 | Card rendering, cart, WA, event handlers |
| `js/admin-dashboard.js` | 692 | Card CRUD, form validation |
| `js/admin-validation.js` | 44 | Input validation rules |
| `js/supabase.js` | 215 | API layer, image upload |
| `js/i18n.js` | 98 | Translation engine |
| `js/helpers.js` | 3 | DOM helper |
| `js/modal.js` | 93 | Confirmation/alert modals |
| `js/locales/*.js` | ~185×4 | Translations |
| `css/components.css` | 2148 | Card styles |
| `css/variables.css` | 220 | Design tokens |
| `css/layout.css` | 135 | Menu grid |
| `css/responsive.css` | 280 | Breakpoints (no card rules) |
| `css/rtl.css` | 234 | RTL badge override |
| `index.html` | 284 | Font loading, page shell |

---

## 2. Architecture Review

### 2.1 — Component model: none

The `dishCard()` function is a standalone template-string builder. There is no component class, no props interface, no lifecycle, no virtual DOM. The card is recreated from scratch on every `renderMenuGrid()` call. All 6+ cards in the feature grid + all menu cards are re-rendered on every filter change or admin save.

```js
// menu.js:235 — Pure string concatenation
function dishCard(dish) {
  // ... template literal with embedded SVG (~1120 chars)
}
```

**Impact:** Any JS error in `dishCard()` silently breaks the entire grid. No isolation, no recovery.

### 2.2 — State management: module-level variables

```js
// menu.js:5-12
let WA_NUMBER = '212630230803';
let SETTINGS = {};
let MENU_DATA = [];
let CART = [];
let CATEGORIES = [...];
```

No state library, no reactivity. Cart, menu data, filter, and settings are all global mutable state. A runtime error in one area can corrupt another.

### 2.3 — Data flow: Supabase → JSON → template string

```
Supabase → safeQuery() → MENU_DATA → dishCard() → innerHTML
```

No data normalization, no caching layer beyond MENU_CACHE (which never expires), no loading states (skeleton only for hero, not for cards).

### 2.4 — Dead code / unused fields

| Field | Defined in DB | Used in render | Notes |
|---|---|---|---|
| `dish.description` | ✅ `menu_items.description` (JSONB) | ❌ | Mapped in `loadMenuData()` but never rendered |
| `dish.tags` | ❌ No DB column | ❌ | `tags: item.tags \|\| []` references undefined column |
| `dish.popular` | ✅ `menu_items.popular` (boolean) | ⚠️ | Used for featured filter but no visual treatment on card |
| `dish.image_url` | ✅ `menu_items.image_url` | ✅ | Rendered as `<img src>` |

### 2.5 — Image upload flow

`admin-dashboard.js` → `uploadImage()` in `supabase.js` resizes to 800px width, JPEG quality 0.8, uploads to Supabase Storage `dish-images` bucket. Returns public URL. **No delete on image replacement** — old images accumulate.

---

## 3. UI Review

### 3.1 — Card anatomy (current DOM)

```
┌─── dish-card ─────────────────────┐  border: 1px glass-border
│  ┌── dish-img-wrap (4/3) ──────┐  │  border-radius: 20px
│  │   <img> or placeholder      │  │  overflow: hidden
│  │   ::after gradient overlay  │  │  ← NEW (added 2026-06-24)
│  │                       [CAT] │  │  badge top-right (11px)
│  └─────────────────────────────┘  │
│  ┌── dish-body ─────────────────┐  │  padding: 16px 16px 8px
│  │  dish-name (Playfair 20px)  │  │  bold, lh 1.15
│  │  ── dish-price-line ────    │  │  border gold 20%
│  │  dish-price (Bebas 24px)    │  │  semibold, accent gold
│  │  ── dish-actions ────────   │  │  flex row
│  │  [📱 Commander]       [+]   │  │  wa-btn (44px) + add-cart (44px)
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

### 3.2 — Design system compliance

| Token | Used in card | Value | Compliant |
|---|---|---|---|
| `--card` | `.dish-card` background | `rgba(255,255,255,0.04)` | ✅ |
| `--glass-border` | Card border | `rgba(212,166,74,0.12)` | ✅ |
| `--radius-lg` | Card border-radius | `20px` | ✅ |
| `--font-heading` | `.dish-name` | Playfair Display | ✅ |
| `--text-xl` | `.dish-name` font-size | `20px` | ✅ |
| `--fw-bold` | `.dish-name` weight | `700` | ✅ |
| `--text-tiny` | `.badge` font-size | `11px` | ✅ |
| `--accent` | `.dish-price` color | `#B8842F` | ✅ |
| `--shadow-lg` | Card hover shadow | tokenised | ✅ |
| `--shadow-gold` | Card hover glow | tokenised | ✅ |

**Non-compliant:** `.dish-price` uses hardcoded `'Bebas Neue', sans-serif` — should use a design token `--font-price` or similar.

### 3.3 — Badge overlap with gradient overlay

The badge (z-index: auto, positioned absolute) renders above the `::after` gradient (z-index: 1). **Correct.** The badge has `backdrop-filter: blur(8px)` which works over the gradient + image. No visual conflict.

### 3.4 — Duplicate `display` declaration on `.cart-badge`

```css
.cart-badge {
  display: flex;    /* line 816 */
  display: none;    /* line 818 — overrides line 816 */
}
```

The `display: flex` is dead code — the element is always `display: none` until `.show` class is added.

---

## 4. UX Review

### 4.1 — CRITICAL: Card has `cursor: pointer` but no action

```css
.dish-card {
  cursor: pointer;
}
```

The entire card has a pointer cursor, suggesting it is clickable. But the only active areas are the WA button and add-to-cart button. Clicking the card body, name, price, or image does nothing. This is a **false affordance**.

### 4.2 — HIGH: No dish description on card

The `description` field exists in the Supabase schema (`menu_items.description JSONB`) and is mapped in `loadMenuData()` but never rendered. Users see only the dish name — no ingredients, no preparation style, no flavour notes. This forces them to guess or contact the restaurant for basic information.

### 4.3 — HIGH: No dish detail view

There is no modal, panel, or expanded view for any dish. Users cannot:
- See a larger version of the photo
- Read the full description
- View dietary/allergen information
- See serving suggestions

### 4.4 — MEDIUM: Price formatting inconsistency

| Context | Format | Example |
|---|---|---|
| Card (French) | `{{price}} DH` | `120 DH` |
| Card (English) | `{{price}} MAD` | `120 MAD` |
| Cart total (all langs) | `{{price}} DH` | Uses `fr.js` format via `t('dish.price')` |
| Cart line items | `item.price * item.qty` | `240.00 DH` |

The cart always uses the French currency label regardless of active language because the format is baked into the translation string.

### 4.5 — MEDIUM: No visual treatment for popular/featured dishes

The `popular` boolean is fetched from the DB and used to filter the featured section on the home page, but on the menu grid, popular dishes look identical to regular dishes. No gold accent, no "Recommendé" badge, no elevated card style.

### 4.6 — LOW: Empty state is plain text

The "no results" state (`renderMenuStatus()`) shows plain text with no icon, no illustration, no suggestion chips. The unavailable state has a retry button but the empty state has none.

### 4.7 — LOW: Toast notification duration not adjustable

`showToast()` uses a fixed 2500ms timeout. On slow connections or for long messages, the toast disappears before the user finishes reading.

---

## 5. Accessibility Review

### 5.1 — CRITICAL: No `aria-label` on interactive buttons

```html
<button class="add-cart-btn" data-action="cart">+</button>
<button class="wa-btn" data-action="order">
  <svg>...</svg>
  Commander
</button>
```

- `.add-cart-btn`: Screen readers announce "plus" — meaningless without context. Needs `aria-label="Ajouter au panier"`.
- `.wa-btn`: Text "Commander" is inside the button alongside an SVG. The SVG has no `aria-hidden="true"`, so screen readers may read the SVG path data.

### 5.2 — HIGH: No `:focus-visible` styles on any card element

```css
* { -webkit-tap-highlight-color: transparent; }
```

The global reset removes mobile tap highlights. No `:focus-visible` outline is defined. Keyboard users navigating with Tab receive zero visual feedback on any card button.

### 5.3 — MEDIUM: Badge font-size below WCAG minimum

`.badge` uses `--text-tiny: 11px`. WCAG SC 1.4.4 requires text to be resizable to 200% without loss of content. At 11px, the badge text is already very small. In Arabic (`Tajawal` at 11px), readability is severely compromised.

### 5.4 — MEDIUM: No `alt` text fallback for placeholder images

```html
<img src="${dish.image}" alt="${localized(dish.name)}" .../>
```

When `dish.image` is empty string, the `<img>` still renders with `src=""`, causing a broken image icon. The `alt` text is present (dish name), which helps, but the broken image still appears as a visual glitch.

### 5.5 — HIGH: Add-to-cart button below minimum touch target (pre-fix)

**RESOLVED** — `.add-cart-btn` is now 44×44px. Meets Apple HIG and Android Material guidelines.

### 5.6 — MEDIUM: Badge `backdrop-filter` may cause rendering artifacts

`backdrop-filter: blur(8px)` on `.badge` is not supported in all browsers. Firefox on Linux, some mobile browsers may ignore it or render incorrectly. The badge fallback (translucent background) is acceptable but should be verified.

---

## 6. Performance Review

### 6.1 — HIGH: WhatsApp SVG duplicated per card instance

The SVG path string for the WhatsApp icon (~1120 characters) is inlined inside the `dishCard()` template. For a menu with 24 dishes, this is ~27KB of duplicated SVG markup in the DOM. This increases HTML size and parse time.

**Fix:** Define the SVG once (e.g., as a `<symbol>` in `<svg>` at page level, or as a constant string referenced by ID) and use `<use href="#wa-icon"/>`.

### 6.2 — MEDIUM: No image lazy loading

```html
<img src="${dish.image}" alt="..." class="dish-img"/>
```

No `loading="lazy"` attribute. All dish images start loading immediately when the grid renders, even if they are below the fold. On a page with 24+ images, this causes unnecessary bandwidth usage and delays above-fold content.

### 6.3 — MEDIUM: No image dimensions → layout shift

```html
<img src="..." alt="..." class="dish-img"/>
```

No `width`/`height` attributes. The image container has `aspect-ratio: 4/3`, but the `<img>` itself does not declare dimensions. If the CSS fails to load or is overridden, images collapse to 0 height before the `object-fit` kicks in.

### 6.4 — LOW: CSS transition on `box-shadow` triggers repaints

```css
.dish-card:hover {
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-4px);
}
```

Changing `box-shadow` on hover triggers a composite layer repaint. Combined with `transform`, this is generally GPU-accelerated, but on low-end mobile devices the glow shadow (40px blur) can cause jank.

**Fix:** Use `will-change: transform;` on `.dish-card`, and consider using `opacity` on a pseudo-element shadow instead of animating `box-shadow`.

### 6.5 — LOW: ES module imports from CDN without caching strategy

```js
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const { default: i18next } = await import('https://esm.sh/i18next@23.16.4');
```

Dependencies are loaded dynamically from `esm.sh`. No service worker, no preload, no stale-while-revalidate strategy. A CDN outage breaks the entire application.

---

## 7. Code Quality Review

### 7.1 — CRITICAL: XSS via template injection

```js
// menu.js:250,265,272
<img src="${dish.image}" alt="${localized(dish.name)}" .../>
<div class="dish-name">${localized(dish.name)}</div>
<button ...>${t('dish.orderBtn')}</button>
```

`localized(dish.name)` returns untrusted user input directly into `innerHTML`. If a dish name contains `</div><script>alert(1)</script>`, it executes. The `description` field (JSONB, multilingual) has the same vulnerability in the admin modal form rendering.

**Severity:** Critical — this is a stored XSS vector via the admin panel.

### 7.2 — HIGH: Magic number for WA number

```js
let WA_NUMBER = '212630230803';   // hardcoded fallback
```

If `getSettings()` fails or returns no `wa_number`, the hardcoded fallback is used silently. This could send orders to the wrong WhatsApp account without warning.

### 7.3 — MEDIUM: Dead CSS custom properties

```css
--gold:            var(--accent);
--gold2:           var(--secondary-light);
--gold3:           var(--secondary);
--gold-dim:        var(--accent-dim);
--gold-primary:    var(--secondary);
--border-gold:     rgba(212, 166, 74, 0.25);
--fire-orange:     var(--secondary);
--shadow-glow:     var(--shadow-red);
--color-spicy:     #C4622D;
--color-spicy-dim: rgba(196,98,45,0.15);
```

These 9 variables in `variables.css` are **never referenced** anywhere in the CSS. They are backward-compatibility aliases that serve no purpose except to confuse maintainers.

### 7.4 — MEDIUM: `--space-2xs: 6px` > `--space-xs: 4px`

```css
--space-xs:  4px;
--space-2xs: 6px;
```

The naming convention suggests `--space-2xs` should be smaller than `--space-xs` (extra-extra-small vs extra-small), but it is actually larger (6px > 4px). This is a semantic bug that will cause future spacing errors.

### 7.5 — LOW: Cart stores full dish object unnecessarily

```js
cart.push({ ...dish, qty: 1 });
```

The spread operator copies all dish fields (`name`, `price`, `category_id`, `description`, `tags`, `available`, `popular`, `image`) into the cart. Only `name`, `price`, `id`, and `qty` are used. Unused fields bloat localStorage if cart is persisted.

### 7.6 — LOW: `console.time()`/`console.timeEnd()` left in production

```js
console.time('loadSettings');
console.timeEnd('loadSettings');
console.time('initMenu');
console.timeEnd('initMenu');
```

Timing debug statements are active in production code. These should be removed or gated behind a debug flag.

---

## 8. Security & Data Validation Review

### 8.1 — CRITICAL: Stored XSS via dish data

See 7.1. The `dish.name` and `dish.description` fields are JSONB objects with multilingual values. All values are user-supplied via the admin form and rendered unsanitized via `innerHTML`.

**Impact:** Any admin user (or attacker who compromises admin credentials) can inject arbitrary JavaScript that executes on every visitor's browser.

**Fix:** Use `textContent` instead of `innerHTML` for all user-supplied text. Or sanitize with DOMPurify.

### 8.2 — MEDIUM: CDN imports without SRI

```js
await import('https://esm.sh/@supabase/supabase-js@2');
await import('https://esm.sh/i18next@23.16.4');
```

Third-party scripts loaded from CDN with no Subresource Integrity hash. A compromised CDN could serve malicious code.

### 8.3 — MEDIUM: Input validation bypass via form data

`validateItem()` checks `nameFR` and `price` existence, but does not:
- Validate string length (a 10KB name is accepted)
- Sanitize HTML in name/description
- Validate image file type beyond `accept="image/*"`
- Limit image file size before upload

### 8.4 — LOW: No CSRF protection

Admin operations (add/edit/delete items, categories, settings) are authenticated via Supabase session but have no CSRF token. A CSRF attack could modify restaurant data if an admin visits a malicious site while logged in.

---

## 9. Responsive Design Review

### 9.1 — MEDIUM: No card-specific responsive breakpoints

```css
/* responsive.css — NO dish-card rules */
@media (min-width: 540px) { .menu-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 860px) { .menu-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1200px) { .menu-grid { grid-template-columns: repeat(4, 1fr); } }
```

All responsive behavior comes from the grid. The card itself has zero responsive rules. At 540px (2 columns, ~250px card width), the WA button text "Commander" + SVG icon fits, but on very narrow screens (<360px), the button may overflow.

### 9.2 — LOW: No WA label hiding breakpoint

At the narrowest column width (~185px on 2-column grid at 400px viewport), the WA button with text "Commander" + 16px icon may cause horizontal overflow. No CSS breakpoint hides the label.

### 9.3 — MEDIUM: No RTL overrides for `.dish-actions` and `.dish-price-line`

RTL CSS handles the badge position swap (`.badge` → `left: 12px`), but:
- `.dish-actions` flex direction: `row` is correct for both LTR and RTL
- `.dish-price-line` border orientation: `border-top` is correct for both
- WA button SVG: May need `transform: scaleX(-1)` in RTL for arrow icons, but the WhatsApp icon is symmetrical — **no issue**

However, `gap` direction, `margin`, and `padding` for RTL should be verified. Currently `margin-top` is used for spacing, which is direction-agnostic — **correct**.

---

## 10. Issues & Recommendations

### Critical (6)

| ID | Issue | File(s) | Impact | Fix |
|---|---|---|---|---|
| C1 | Stored XSS via `localized(dish.name)` in `innerHTML` | `menu.js:265` | Arbitrary JS execution on every page load | Use `textContent` instead of `innerHTML`, or sanitize with DOMPurify |
| C2 | Stored XSS via dish data in admin rendering | `admin-dashboard.js:94` | Admin panel XSS via names/descriptions | Sanitize output, validate input length/encoding |
| C3 | Card has `cursor: pointer` but no click action | `components.css:601` | False affordance, user frustration | Remove `cursor: pointer` or add card click → detail modal |
| C4 | No `aria-label` on add-to-cart button | `menu.js:275` | Screen readers announce "+" only | Add `aria-label="Ajouter au panier"` / `aria-label="Add to cart"` per locale |
| C5 | Duplicate WhatsApp SVG per card instance | `menu.js:272` | ~27KB redundant HTML for 24 dishes | Use `<use href="#wa-icon"/>` with `<symbol>` definition |
| C6 | No `:focus-visible` styles on any interactive element | `base.css`, `components.css` | Keyboard users get zero focus feedback | Add `:focus-visible` outline matching brand (`--secondary`) |

### High (12)

| ID | Issue | File(s) | Impact | Fix |
|---|---|---|---|---|
| H1 | No dish description on card | `menu.js:235-280` | Users cannot learn about dishes | Render `dish.description` as 1-line truncated below name |
| H2 | No dish detail modal | `menu.js` | No way to explore dishes | Add modal triggered by card click |
| H3 | No visual treatment for popular/featured dishes | `components.css`, `menu.js:46` | Popularity signal unused | Add `.dish-card--popular` class with gold left-border |
| H4 | No dietary/allergen indicators | `menu.js`, `components.css` | No dietary info visible | Add `dietary_tags` column + pill rendering on image |
| H5 | No image `loading="lazy"` | `menu.js:250` | All images load immediately | Add `loading="lazy"` to `<img>` |
| H6 | Image has no `width`/`height` attributes | `menu.js:250` | Potential layout shift | Add `width="400" height="300"` matching 4/3 ratio |
| H7 | Badge 11px below WCAG comfort threshold | `components.css:716-717` | Hard to read, especially Arabic | Increase to 12px minimum |
| H8 | Cart stores full dish object unnecessarily | `menu.js:346` | Memory bloat, localStorage waste | Store only `{ id, name, price, qty }` |
| H9 | Price formatting varies between card and cart | `locales/*.js`, `menu.js:419` | Inconsistent currency display | Centralise currency format in i18n key |
| H10 | No RTL coverage for card action area | `rtl.css` | Untested in Arabic | Add RTL overrides for `.dish-actions` if needed |
| H11 | No CSRF protection on admin mutations | `admin-dashboard.js` | Potential CSRF attacks | Add CSRF token or SameSite cookie check |
| H12 | WA label doesn't hide on narrow screens | `responsive.css` | Overflow on <360px | Add `@media (max-width: 400px) { .wa-btn span { display: none } }` |

### Medium (9)

| ID | Issue | File(s) | Impact | Fix |
|---|---|---|---|---|
| M1 | `--space-2xs: 6px` > `--space-xs: 4px` — naming bug | `variables.css:170-171` | Future spacing errors | Rename to `--space-2xs: 4px` or `--space-2xs: 2px` |
| M2 | 9 dead CSS variables (`--gold`, `--fire-orange`, etc.) | `variables.css:19-29` | Maintenance confusion | Remove unused aliases |
| M3 | `console.time()` in production | `menu.js:96,100,534,548` | Debug output in prod | Remove or gate behind `if (DEBUG)` |
| M4 | No sanitization on image file input | `admin-dashboard.js:193` | Non-image files accepted | Validate `type` starts with `image/`, limit size |
| M5 | CDN imports without SRI | `supabase.js:32`, `i18n.js:13-14` | Compromised CDN = RCE | Add integrity hashes or self-host |
| M6 | `cart-badge` duplicate `display` property | `components.css:816,818` | Dead CSS | Remove `display: flex` (line 816) |
| M7 | No loading skeleton for menu grid | `menu.js:316-337` | Blank area while data loads | Add 6 skeleton cards during fetch |
| M8 | Empty state has no icon or suggestions | `menu.js:311` | Plain text feels unfinished | Add SVG icon + suggestion pills |
| M9 | `backdrop-filter: blur(8px)` on badge not universally supported | `components.css:723-724` | Visual degradation on some browsers | Add `@supports (backdrop-filter: blur(1px))` fallback |

### Low (5)

| ID | Issue | File(s) | Impact | Fix |
|---|---|---|---|---|
| L1 | `alt` attribute present but `src=""` on missing images | `menu.js:250` | Broken image icon | Skip `<img>` entirely if `!dish.image`, or use placeholder |
| L2 | Toast duration 2500ms is fixed | `menu.js:191` | Too fast for long messages | Make duration configurable or proportional to text length |
| L3 | Populated field mapped but never used: `tags` | `menu.js:49` | Reference to undefined DB column | Remove or add `tags` column |
| L4 | Hardcoded WA fallback number | `menu.js:5` | Silent routing to wrong WA | Show admin alert if WA is not configured |
| L5 | `box-shadow` transition triggers repaint | `components.css:604-607` | Potential jank on mobile | Animate `opacity` on a pseudo-element instead |

---

## 11. Priority Action Plan

### Immediate (security — fix before launch)

| Priority | ID | Effort |
|---|---|---|
| 1 | C1, C2 — XSS via dish data | ⏱ 30 min |
| 2 | C4 — aria-labels on all card buttons | ⏱ 15 min |
| 3 | H11 — CSRF protection | ⏱ 1 hour |

### Short-term (UX & accessibility — next session)

| Priority | ID | Effort |
|---|---|---|
| 4 | C3 — Fix card cursor (remove or add detail view) | ⏱ 15 min |
| 5 | C6 — Add `:focus-visible` styles | ⏱ 20 min |
| 6 | H1 — Render dish description on card | ⏱ 1 hour |
| 7 | H5 — Add `loading="lazy"` to images | ⏱ 5 min |
| 8 | H7 — Increase badge to 12px | ⏱ 2 min |

### Medium-term (quality & performance)

| Priority | ID | Effort |
|---|---|---|
| 9 | C5 — Move WA SVG to `<symbol>` / sprite | ⏱ 30 min |
| 10 | H8 — Optimise cart data shape | ⏱ 15 min |
| 11 | M1 — Fix `--space-2xs` naming | ⏱ 5 min |
| 12 | M2 — Remove dead CSS variables | ⏱ 10 min |
| 13 | M6 — Fix duplicate `display` in cart-badge | ⏱ 1 min |

### Long-term (architectural)

| Priority | ID | Effort |
|---|---|---|
| 14 | H2 — Dish detail modal component | ⏱ 4 hours |
| 15 | H3 — Featured/popular visual treatment | ⏱ 1 hour |
| 16 | M7 — Menu grid skeleton loading | ⏱ 2 hours |
| 17 | All — Consider DOMPurify or template engine | ⏱ 2 hours |

---

## 12. Final Scorecard

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Architecture | 6/10 | ×1.0 | 6.0 |
| UI Design | 7/10 | ×1.5 | 10.5 |
| UX | 5/10 | ×1.5 | 7.5 |
| Accessibility | 3/10 | ×1.5 | 4.5 |
| Performance | 6/10 | ×1.0 | 6.0 |
| Code Quality | 5/10 | ×1.0 | 5.0 |
| Security | 4/10 | ×2.0 | 8.0 |
| Responsive | 6/10 | ×1.0 | 6.0 |
| **Total** | | | **53.5 / 90 = 5.9/10** |

### Breakdown by priority

| Severity | Count | Action required |
|---|---|---|
| Critical | 6 | Fix before launch |
| High | 12 | Fix in next development session |
| Medium | 9 | Fix within 2 weeks |
| Low | 5 | Fix when convenient |

### Quick fixes (can be done in <30 min total)

1. Remove `cursor: pointer` from `.dish-card` (or add card click handler)
2. Add `loading="lazy"` to dish images
3. Add `aria-label` to add-to-cart button
4. Add `:focus-visible` styles to base.css
5. Increase badge font-size from 11px to 12px
6. Fix `--space-2xs` / `--space-xs` naming
7. Remove duplicate `display: flex` in `.cart-badge`
8. Remove `console.time()` calls
9. Add `@media (max-width: 400px)` WA label hide

---

*End of PRODUCT_CARD_AUDIT.md — 32 findings across 12 dimensions*
