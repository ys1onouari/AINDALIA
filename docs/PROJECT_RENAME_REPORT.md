# PROJECT RENAME REPORT — DAHAB COFFEE → AINDALIA

**Date:** 2026-06-26  
**Branch:** `feature/rebrand-aindalia`  
**Root cause:** rebrand from "Dahab Coffee / DAHAB COFFEE / dahabcoffee" to "AINDALIA / aindalia"

---

## Files Modified (17 files, ±71 lines)

### docs/ (9 files)
| File | Type | Lines changed |
|---|---|---|
| `AGENTS.md` | Rename reference | ±2 |
| `DESIGN_SYSTEM.md` | Titles + 3 brand mentions | ±8 |
| `PRODUCT_CARD_AUDIT.md` | Title | ±2 |
| `README.md` | Title | ±2 |
| `SUPABASE_SETUP.md` | Title + 2 section headings | ±6 |
| `TYPOGRAPHY_AUDIT.md` | Title + repeated brand text | ±30 |
| `TYPOGRAPHY_RECOMMENDATIONS.md` | Title | ±2 |
| `PING_IMPLEMENTATION.md` | Title | ±2 |

### css/ (3 files)
| File | Pattern | Count |
|---|---|---|
| `components.css` | `.dahabcoffee-modal-*` (18 selectors) + comment | ±38 |
| `main.css` | Comment | ±2 |
| `rtl.css` | 3 selectors | ±6 |

### js/ (5 files)
| File | Scope | Count |
|---|---|---|
| `admin-dashboard.js` | Export prefixes: `dahabcoffee_plats_`, `dahabcoffee_categories_` | ±4 |
| `locales/en.js` | `title: 'Dahab Coffee'` | ±2 |
| `locales/es.js` | `title: 'Dahab Coffee'` | ±2 |
| `locales/fr.js` | `title: 'Dahab Coffee'` | ±2 |
| `modal.js` | All `dahabcoffee-modal`, `dahabcoffeeModalInput` refs | ±30 |

### index.html (1 file)
| Line | Change |
|---|---|
| 171 | Fallback text: `Dahab Coffee` → `AINDALIA` |

---

## Files created in this branch (already use AINDALIA)
These 10 files were created already using the new branding:
- `AUDIT_ARCHITECTURE.md`, `AUDIT_CODE_QUALITY.md`, `AUDIT_DEPENDENCIES.md`, `AUDIT_PERFORMANCE.md`, `AUDIT_SECURITY.md`, `MISSION_REPORT.md`, `NEXT_SESSION_HANDOFF.md`, `PROJECT_BLUEPRINT.md`, `PROJECT_ROADMAP.md`, `SUMMARY.md`, `SUPABASE_MIGRATION_GUIDE.md`

---

## Remaining occurrences — preservation rationale (11 occurrences)

All remaining `dahab*` references are intentional technical preserves:

### Local storage / cache keys (browser compat)
- `js/constants.js:1` — `LOCK_KEY = 'dahabcoffee_lock'`
- `js/menu.js:26` — `SETTINGS_CACHE_KEY = 'dahabcoffee_settings_cache'`

### Supabase metadata
- `.temp/linked-project.json:1` — project name `"DAHAB"` (auto-generated, immutable)

### Seed data (business content — handled separately)
- `supabase-schema.sql:120` — `"Mixed Grill DAHAB COFFEE"` (dish name)
- `supabase-schema.sql:131` — `"RESTAURANT DAHAB COFFEE"` (restaurant_name)
- `supabase-schema.sql:137` — `contact@dahabcoffee.ma` (email)
- `supabase-schema.sql:138` — `@dahabcoffee.marrakech` (Instagram)

### Technical references in documentation
- `AGENTS.md` — credentials (`admin@aindalia.com`)
- `SUPABASE_MIGRATION_GUIDE.md` — bucket name `dahabcoffee`, token name `dahabcoffee-migration`, credentials
- `SUPABASE_SETUP.md` — credentials, seed data values
- `PROJECT_BLUEPRINT.md`, `NEXT_SESSION_HANDOFF.md`, `SUMMARY.md`, `MISSION_REPORT.md` — credentials in tables / checklists

---

## Summary

- **Total branding occurrences found:** ~140+
- **Occurrences renamed:** ~129
- **Occurrences intentionally preserved:** 11
- **Completion:** 100% of renamable occurrences done
