# Digital Granthapal — Vβeta 6.1 (site Vβeta 5.0)

**Digital Granthapal System** for the Pushti Sahitya Digital Granthalaya.

## Principle

Existing Pushti Sahitya content is **preserved unchanged**.

This release is **ADD-ONLY**:

- No existing text rewritten, corrected, translated, renamed, or removed
- No existing book/grantha metadata altered
- No existing navigation labels altered
- Existing functionality preserved
- New modular assistant layered on top

## What was added

| File | Role |
|------|------|
| `digital-granthapal-v61.js` | Virtual librarian UI, avatar, panel, shortcuts |
| `digital-granthapal-v61.css` | Avatar / panel styles and subtle animations |
| `DIGITAL_GRANTHAPAL_V61.md` | This documentation |
| Loader snippet at end of `script.js` | Loads the module globally without changing prior logic |
| Service Worker entries | Precaches the new CSS/JS (`pushti-sahitya-v5.0-dg61`) |

## Character

**Digital Granthapal** — A Virtual Librarian of the Pushti Sahitya Digital Granthalaya.

Visual direction: scholarly, dignified, calm, library-oriented, traditional Indian scholarly influence, compatible with the existing Pop-Art design system.

Implementation: lightweight SVG + CSS 3D-style depth (no Three.js, no GLB models, no external CDNs).

## Behaviors

- **Idle** — gentle float, breathing, occasional blink
- **Greeting** — hand wave when panel opens
- **Reading** — book emphasis
- **Searching** — head motion when finding a grantha
- **Navigation** — pointing gesture

Panel actions (new interface text only):

- Find a Grantha → focuses `#search-input` if present, else navigates to `granthas.html`
- Library Home → `index.html`
- Search Grantha → `granthas.html`
- Ṣoḍaśa Granthas → `shodash-granthas.html`
- About the Library → `about.html`

## Accessibility

- Keyboard operable avatar and panel
- Visible focus states
- ARIA labels / dialog semantics
- Escape closes the panel
- `prefers-reduced-motion: reduce` disables decorative animations

## Security

- No `eval`
- DOM built with `createElement` / `textContent` (no unsafe HTML injection)
- Same-origin relative navigation
- No tracking or personal data collection
- Existing `protection.js` and security headers remain in force

## PWA

New assets are listed in the service worker precache list so offline mode continues to serve the assistant shell when cached.

## Version note

Identification **Vβeta 6.1 (site Vβeta 5.0)** is added as *new* labeling on the assistant panel only. Existing version badges and documentation strings elsewhere in the project were not replaced.

## Local preview

```bash
cd public
python3 -m http.server 8080
```

Open http://localhost:8080 — the Digital Granthapal appears at the lower-right on compatible pages.
