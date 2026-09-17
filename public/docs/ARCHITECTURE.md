# Architecture — Pushti Sahitya Vβeta 5.0

Static multi-page PWA.

- Shared chrome: `header.html` / `footer.html` injected by `script.js`
- Policy pages live in `policies/` and use `../` asset paths
- `script.js` computes a site-root prefix for nested pages so partials and links resolve correctly
- Data: `granthas.json`
- PWA: `manifest.webmanifest`, `sw.js`
- Docs: `docs/`

No traditional database or authenticated API.
