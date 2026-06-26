# TYPOGRAPHY RECOMMENDATIONS — AINDALIA Dish Cards

> **Purpose:** Analysis of why menu item names and prices may feel less premium.
> **Scope:** Dish card typography, visual hierarchy, spacing, and density.
> **Source of truth:** `TYPOGRAPHY_AUDIT.md`, `css/components.css:L594-L681`
> **Date:** 2026-06-24

---

## Table of Contents

1. [Dish Card — Current Anatomy](#1-dish-card--current-anatomy)
2. [Dish Name Line-Height Too Loose](#2-dish-name-line-height-too-loose)
3. [Dish Body Padding](#3-dish-body-padding)
4. [Price Visual Weight vs Name Weight](#4-price-visual-weight-vs-name-weight)
5. [Price Size Premiumisation](#5-price-size-premiumisation)
6. [Card Height and Text Density](#6-card-height-and-text-density)
7. [Image-to-Text Relationship](#7-image-to-text-relationship)
8. [Font Weight Distribution Across the Card](#8-font-weight-distribution-across-the-card)
9. [Before/After Comparison Table](#9-beforeafter-comparison-table)
10. [Summary — Quick Wins vs Structural Changes](#10-summary--quick-wins-vs-structural-changes)

---

## 1. Dish Card — Current Anatomy

```
┌─────────────────────────────────┐
│                                 │
│          IMAGE (4:3)            │     aspect-ratio: 4/3
│                                 │     overflow: hidden
│                                 │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Dish Name                 │  │     padding: var(--space-md)  ← 16px
│  │                           │  │     --text-lg (18px)
│  │                           │  │     --fw-semibold (600)
│  │                           │  │     line-height: var(--lh-relaxed)  ← 1.5 !
│  ├───────────────────────────┤  │
│  │ ← Price (24px, bold)      │  │     padding-top: var(--space-sm)  ← 8px
│  │              (Add to cart)│  │     border-top: 1px solid ...
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Current Metrics

| Property | Value | Token |
|---|---|---|
| Card border-radius | 20px | `--radius-lg` |
| Image aspect ratio | 4:3 | — |
| Body padding | 16px all sides | `--space-md` |
| Name font-size | 18px | `--text-lg` |
| Name font-weight | 600 | `--fw-semibold` |
| Name line-height | **1.5** | `--lh-relaxed` |
| Name margin-bottom | 4px | `--space-xs` |
| Footer padding-top | 8px | `--space-sm` |
| Price font-size | 24px | `--text-2xl` |
| Price font-weight | 700 | `--fw-bold` |
| Price color | `#B8842F` | `--accent` |
| Card gap (body → footer) | 4px + 8px = 12px | — |

---

## 2. Dish Name Line-Height Too Loose

### Current State

```css
.dish-name {
  font-family: var(--font-heading);
  font-size: var(--text-lg);        /* 18px */
  font-weight: var(--fw-semibold);  /* 600 */
  color: var(--text);
  margin-bottom: var(--space-xs);   /* 4px */
  line-height: var(--lh-relaxed);   /* 1.5 ← PROBLÈME */
}
```

### Problem Explanation

`line-height: 1.5` on a heading creates **25.5px of vertical space** for each line of 18px text. This is paragraph spacing, not heading spacing. Premium restaurant menus use tight line-heights (1.15–1.25) on dish names to:

- Create a compact, elegant block
- Group the name visually as a single unit
- Keep the card dense and information-dense (luxury = concise)
- Prevent the name from touching or overlapping the price divider below

At 1.5, a two-line dish name occupies **54px** of vertical space (18 × 1.5 × 2). At 1.15, the same name occupies **41.4px** — a 23% reduction.

### Visual Impact

- **Before:** Dish name feels "loose" and disconnected from itself. Multi-line names look like two separate items.
- **After:** Dish name reads as a cohesive unit. Text block is denser, more controlled, and visually premium.

### Suggested Improvement

```css
.dish-name {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--fw-semibold);
  color: var(--text);
  margin-bottom: var(--space-xs);
  line-height: var(--lh-tight);  /* 1.15 — compact, premium */
}
```

### Before/After CSS

```css
/* BEFORE */
.dish-name {
  line-height: var(--lh-relaxed);  /* 1.5 → loose, paragraph-like */
}

/* AFTER */
.dish-name {
  line-height: var(--lh-tight);    /* 1.15 → tight, heading-like */
}
```

---

## 3. Dish Body Padding

### Current State

```css
.dish-body {
  padding: var(--space-md);  /* 16px all sides */
}
```

### Problem Explanation

`--space-md` (16px) on all four sides of `.dish-body` creates:

- **40px** of vertical padding between the image bottom and the price footer (16px top padding + 4px name margin-bottom + footer padding-top 8px = 16 + 6.25px effective name height + 4 + 8 = ~34px of padding/spacing vs ~23.6px of content for a single-line name)
- **Content-to-padding ratio:** At 16px padding on all sides, a single-line name + price pair occupies ~42px of content within 74px of body height — only **57% content efficiency**.

Premium restaurant cards use tighter padding (12px–14px) to make the text feel more intrinsic to the card rather than floating in negative space. The 16px padding is consistent with the system's `--space-md` token but too generous for a compact dish card.

### Visual Impact

- **Before:** Dish name floats in a padded box with generous white space around it. The card feels stretched vertically.
- **After:** Tighter padding makes the name and price feel anchored to the image, creating a single cohesive card.

### Suggested Improvement

```css
.dish-body {
  padding: var(--space-sm) var(--space-md);  /* 8px top/bottom, 16px sides */
}
```

This reduces top padding from 16px to 8px while keeping horizontal padding for name ellipsis safety. The bottom also naturally tightens.

Alternatively, keep vertical padding at 16px but increase name size to fill the space (see Recommendation 5).

### Before/After CSS

```css
/* BEFORE */
.dish-body {
  padding: var(--space-md);  /* 16px */
}

/* AFTER */
.dish-body {
  padding: var(--space-sm) var(--space-md);  /* 8px vertical, 16px horizontal */
}
```

---

## 4. Price Visual Weight vs Name Weight

### Current State

```css
.dish-name {
  font-size: var(--text-lg);     /* 18px */
  font-weight: var(--fw-semibold); /* 600 */
}

.dish-price {
  font-size: var(--text-2xl);    /* 24px */
  font-weight: var(--fw-bold);   /* 700 */
}
```

### Problem Explanation

The price is **33% larger** (24px vs 18px) and **100 weight points heavier** (700 vs 600) than the dish name. This creates a visual hierarchy where:

- The **price dominates** the card visually
- The **dish name** (the product being sold) appears secondary
- The eye is drawn to the price first, then the name — the opposite of a premium experience where the product sells itself

Premium restaurant menus de-emphasise prices. The dish name should be the primary visual element. The price should be present but not competing for attention.

### Visual Impact

- **Before:** `**35,00 DH**` under `dish name` — the price has more visual mass and stronger contrast.
- **After:** `dish name` under `**35,00 DH**` — the name commands attention; price is supporting information.

### Suggested Improvement

**Option A — Name upweight (recommended):** Keep both sizes but reduce price weight.

```css
.dish-name {
  font-size: var(--text-xl);     /* 20px — larger name */
  font-weight: var(--fw-bold);   /* 700 — bold name */
}

.dish-price {
  font-size: var(--text-xl);     /* 20px — same as name */
  font-weight: var(--fw-medium); /* 500 — lighter */
  color: var(--accent);          /* gold still distinguishes */
}
```

**Option B — Price downweight:** Keep name at 18px, reduce price.

```css
.dish-price {
  font-size: var(--text-lg);     /* 18px — same size as name */
  font-weight: var(--fw-regular); /* 400 — lighter weight */
  color: var(--accent);           /* gold distinguishes */
}
```

### Before/After CSS

```css
/* BEFORE */
.dish-name  { font-size: 18px; font-weight: 600; }
.dish-price { font-size: 24px; font-weight: 700; }

/* AFTER — Option A */
.dish-name  { font-size: 20px; font-weight: 700; }
.dish-price { font-size: 20px; font-weight: 500; }
```

---

## 5. Price Size Premiumisation

### Current State

```css
.dish-price {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);    /* 24px */
  font-weight: var(--fw-bold);   /* 700 */
  color: var(--accent);          /* #B8842F */
}
```

### Problem Explanation

At 24px bold gold, the price has carnival-banner energy. Premium restaurants use one of two approaches:

1. **Size parity:** Price is the same size as the name (or slightly smaller), distinguished only by color
2. **Size subtlety:** Price is smaller but uses a distinctive color

The current 24px bold gold is the **largest and most attention-grabbing element on the card**. For context, the `.section-title` (the page heading) is 32px. Dish prices being 75% of the page heading size creates a false hierarchy where individual dish prices compete with section titles.

### Visual Impact

- **Before:** Price grabs attention before the dish name. Scanning a menu grid, prices pop before dish names.
- **After:** Dish names lead the visual hierarchy. Prices are discovered on closer inspection — a premium browsing behaviour.

### Suggested Improvement

```css
.dish-price {
  font-family: var(--font-heading);
  font-size: var(--text-lg);      /* 18px — same as name or slightly smaller */
  font-weight: var(--fw-semibold); /* 600 — not full bold */
  color: var(--accent);            /* gold still identifies it as price */
}
```

Combined with the name size recommendation in §4, the ideal pairing is:

| Element | Size | Weight | Color |
|---|---|---|---|
| Dish name | 20px | 700 (bold) | `--text` (white) |
| Dish price | 18px | 500 (medium) | `--accent` (gold) |

This gives the name a 2px / 200-weight advantage over the price. Enough to establish hierarchy without diminishing the price's presence.

### Before/After CSS

```css
/* BEFORE */
.dish-name  { font-size: 18px; font-weight: 600; }
.dish-price { font-size: 24px; font-weight: 700; }

/* AFTER */
.dish-name  { font-size: 20px; font-weight: 700; }
.dish-price { font-size: 18px; font-weight: 500; }
```

---

## 6. Card Height and Text Density

### Current State

The dish card has:

- Image: 4:3 aspect ratio (e.g., 300×225px at 300px card width)
- Body: 16px padding top/bottom
- Name: ~27px height at 18px × 1.5 lh
- Footer area: 8px padding-top + 24px price height = 32px
- **Total body height:** 16 + 27 + 4(mb) + 1(border) + 8 + 24 + 16 = ~96px
- **Content vs padding ratio:** Content (name + price) = ~51px of ~96px = **53%**

### Problem Explanation

Over half the body area is padding and spacing. This makes the card feel:

- **Stretched vertically** — cards look taller than necessary
- **Sparse** — the text block looks lost in the card
- **Less premium** — luxury restaurant cards use tight text blocks that feel considered, not spacious

### Visual Impact

- **Before:** Card body is ~96px for a single-line name + price. The vertical space feels empty.
- **After:** Card body is ~74px. Text takes up a higher ratio of visible space. Card feels denser and more intentional.

### Suggested Improvement

Combine three changes:

```css
.dish-body {
  padding: var(--space-sm) var(--space-md);  /* 16 → 8px vertical */
}

.dish-name {
  line-height: var(--lh-tight);              /* 1.5 → 1.15 */
  margin-bottom: 2px;                         /* 4px → 2px (closer to divider) */
}

.dish-footer {
  padding-top: var(--space-2xs);             /* 8px → 6px */
}
```

**New body height:** 8 + 20.7(18×1.15) + 2(mb) + 1(border) + 6 + 18(price) + 8 = ~63.7px
**Content vs padding ratio:** Content = 38.7px of ~63.7px = **61%** (improved from 53%)

### Before/After CSS

```css
/* BEFORE */
.dish-body          { padding: 16px; }
.dish-name          { line-height: 1.5; margin-bottom: 4px; }
.dish-footer        { padding-top: 8px; }

/* AFTER */
.dish-body          { padding: 8px 16px; }
.dish-name          { line-height: 1.15; margin-bottom: 2px; }
.dish-footer        { padding-top: 6px; }
```

---

## 7. Image-to-Text Relationship

### Current State

```css
.dish-img-wrap {
  aspect-ratio: 4 / 3;       /* Image is landscape */
  overflow: hidden;
  background: var(--bg3);    /* Dark fallback */
}

.dish-body {
  padding: var(--space-md);  /* 16px all sides */
}
```

### Problem Explanation

The 4:3 image aspect ratio creates a **horizontal emphasis** while the body padding creates a **vertical disconnect**. The image ends at a hard line; the text begins 16px below. Premium restaurant menus often:

- Use tighter image-to-text transitions (less padding between image and name)
- Use less horizontal cropping to make dishes look more substantial
- Create a visual bridge between the image and the text (e.g., a subtle gradient, an overlapping element)

### Visual Impact

- **Before:** Image ends → gap → text. Two separate zones.
- **After:** Image flows into text context. The dish feels like a single composed element.

### Suggested Improvement

**Immediate fix — reduce top padding:**

```css
.dish-body {
  padding: var(--space-sm) var(--space-md);  /* 8px top, 16px sides, 12px bottom */
}
```

This brings the name closer to the image, which:

- Creates a stronger visual connection between picture and label
- Reduces the card's perceived height
- Makes the text feel like part of the image layout, not a separate data sheet

**Optional enhancement — overlay gradient (future):**

```css
.dish-img-wrap::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(transparent, var(--bg));
}
```

This creates a fade where the image meets the text, common in premium editorial layouts.

### Before/After CSS

```css
/* BEFORE */
.dish-body {
  padding: 16px;
}

/* AFTER */
.dish-body {
  padding: 8px 16px;
}
```

---

## 8. Font Weight Distribution Across the Card

### Current State

| Element | Weight | Rationale |
|---|---|---|
| `.badge` (category) | **700** bold | Tag label |
| `.dish-name` | **600** semibold | Card title |
| `.dish-price` | **700** bold | Price |
| `.cart-item-name` | **600** semibold | Same as dish name |
| `.cart-item-price` | **700** bold | Same as dish price |

### Problem Explanation

The card has two bold (700) elements (`.badge`, `.dish-price`) and one semibold (600) element (`.dish-name`). This means:

- **The dish name is the least bold text on the card**
- The category badge (700) and the price (700) both out-rank the name
- A secondary label (`.badge`) and the price compete for visual dominance

In premium restaurant cards, the **dish name should be the boldest element**. It's the product being sold. The badge and price should be secondary.

### Visual Impact

- **Before:** Badge (700) → Price (700) → Name (600) — the name is third in weight hierarchy
- **After:** Name (700) → Price (600) → Badge (600 or 500) — the name leads

### Suggested Improvement

```css
.dish-name {
  font-weight: var(--fw-bold);    /* 600 → 700 — name dominates */
}

.dish-price {
  font-weight: var(--fw-medium);  /* 700 → 500 — price recedes */
}

.badge {
  font-weight: var(--fw-semibold); /* 700 → 600 — badge recedes */
}
```

### Before/After CSS

```css
/* BEFORE */
.dish-name  { font-weight: 600; }
.dish-price { font-weight: 700; }
.badge      { font-weight: 700; }

/* AFTER */
.dish-name  { font-weight: 700; }
.dish-price { font-weight: 500; }
.badge      { font-weight: 600; }
```

---

## 9. Before/After Comparison Table

### Complete Dish Card — Consolidated Changes

| Property | Before | After | Improvement |
|---|---|---|---|
| **Dish body padding** | 16px all sides | 8px top/bottom, 16px sides | ~35% vertical density |
| **Name font-size** | 18px (`--text-lg`) | 20px (`--text-xl`) | +11% name presence |
| **Name font-weight** | 600 (`--fw-semibold`) | 700 (`--fw-bold`) | Name now dominates |
| **Name line-height** | 1.5 (`--lh-relaxed`) | 1.15 (`--lh-tight`) | -23% line spacing |
| **Name margin-bottom** | 4px (`--space-xs`) | 2px | Closer to price |
| **Footer padding-top** | 8px (`--space-sm`) | 6px (`--space-2xs`) | Tighter divider |
| **Price font-size** | 24px (`--text-2xl`) | 18px (`--text-lg`) | -25% price size |
| **Price font-weight** | 700 (`--fw-bold`) | 500 (`--fw-medium`) | -2 weight steps |
| **Badge font-weight** | 700 (`--fw-bold`) | 600 (`--fw-semibold`) | Badge recedes |
| **Body content ratio** | ~53% text / 47% space | ~61% text / 39% space | +8% density |

### Visual Hierarchy Shift

```
BEFORE                          AFTER

┌─────────────────────┐        ┌─────────────────────┐
│    [CATEGORY 700]   │        │    [CATEGORY 600]   │  ← badge recedes
│                     │        │                     │
│                     │        │                     │
│    dish name 600    │        │   **Dish Name 700** │  ← name dominates
│                     │        │                     │
│  ─────────────────  │        │  ─────────────────  │
│  **35,00 DH** 700   │        │    35,00 DH 500     │  ← price recedes
└─────────────────────┘        └─────────────────────┘
```

The after state reads in order: **Badge (optional) → Dish Name (primary) → Price (secondary)**. This is the correct premium hierarchy.

---

## 10. Summary — Quick Wins vs Structural Changes

### Quick Wins (CSS-only, no HTML changes)

| # | Change | File:Line | Effort |
|---|---|---|---|
| 1 | `.dish-name` line-height: `var(--lh-relaxed)` → `var(--lh-tight)` | `components.css:665` | 30s |
| 2 | `.dish-name` font-weight: `var(--fw-semibold)` → `var(--fw-bold)` | `components.css:662` | 30s |
| 3 | `.dish-price` font-weight: `var(--fw-bold)` → `var(--fw-medium)` | `components.css:679` | 30s |
| 4 | `.dish-body` padding: `var(--space-md)` → `var(--space-sm) var(--space-md)` | `components.css:656` | 30s |
| 5 | `.dish-footer` padding-top: `var(--space-sm)` → `var(--space-2xs)` | `components.css:672` | 30s |

**Total: ~3 minutes**

### Structural Changes (may need layout review)

| # | Change | Effort |
|---|---|---|
| 6 | `.dish-name` font-size: `var(--text-lg)` → `var(--text-xl)` | 30s |
| 7 | `.dish-price` font-size: `var(--text-2xl)` → `var(--text-lg)` | 30s |
| 8 | `.badge` font-weight: `var(--fw-bold)` → `var(--fw-semibold)` | 30s |

### Impact Matrix

```
                    Effort
              Low ──────────── High
              ┌─────────────────────┐
     High     │   #1 (lh)           │
              │   #2 (name weight)  │
              │   #4 (padding)      │
  Impact      │                     │
              │   #3 (price weight) │
              │   #5 (footer pad)   │
     Low      │                     │
              └─────────────────────┘
```

### Final Thought

The dish card typography issue is not about any single property — it's about the **collective imbalance** where the price out-weighs, out-sizes, and out-ranks the dish name in visual hierarchy. The 8 changes above rebalance the card so that the **product (dish name) leads** and the **price supports** — the hallmark of premium restaurant menu design.

---

*Based on TYPOGRAPHY_AUDIT.md findings. No code changes implemented.*
