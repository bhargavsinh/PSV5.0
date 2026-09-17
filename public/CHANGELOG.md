# Pushti Sahitya — V5.0 CHANGELOG

## Critical fix: Desktop navigation dropdowns

### Problem
Top-level and nested sub-menus did not open reliably on desktop because:
- `[hidden] { display: none !important }` overrode weak hover rules
- Click handlers and outside-click raced
- Nested flyouts went off-screen / were clipped by `overflow-x: hidden`

### V5.0 solution
- Desktop nav is now **CSS-first**: `:hover`, `:focus-within`, and `.is-open` all show panels with `!important`
- Click toggles `.is-open` on the parent wrapper (`.nav-dropdown` / `.nav-nested`) for touch and keyboard
- Nested menus stack under the parent on mid-width screens (1100–1400px) so they never leave the viewport
- Header/footer badges and service-worker cache set to **V5.0**

### Still true from V4
- Perplexity / preview injections removed
- `__psStore` removed (uses localStorage)
- Aggressive protection.js simplified
- Canonical Grantha data accessors
- Detail page handles duplicate IDs
- Mobile logo sizing fixed
- Content text unchanged



## V5.1 — Deep audit and cross-verification
- Audited local HTML links and image references across the public site.
- Audited all 16 Ṣoḍaśa Grantha pages and their table-link targets.
- Corrected a mismatched Sevafalam e-book destination.
- Replaced an incorrect Yamuna image on Krishnashraya with a relevant Shri Vallabhacharyaji illustration.
- Added a relevant Shri Vallabhacharyaji illustration to Ṣoḍaśa Grantha pages that had no local image.
- Completed header/footer local-link verification for mobile/desktop shared navigation.
- Preserved visible text in all non-header/footer HTML files.
