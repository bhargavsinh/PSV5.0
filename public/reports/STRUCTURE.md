# Pushti Sahitya Vβeta 5.0 — Logical structure

## Why HTML stays at `public/` root

HTML page text and `href` values are not modified. Moving `.html` files would break internal links unless every HTML file were edited. Therefore:

- **Pages** remain flat at `public/*.html`
- **Logical grouping** is documented in `data/nav-map.json` (navigation menu groups)
- **Data / reports / docs** use dedicated folders

## Folder layout

```
public/
  *.html                 # All content pages (nav targets)
  script.js, style.css   # Root entry assets (referenced by HTML)
  sw.js, manifest.webmanifest, protection.js
  data/
    granthas.json        # Library index (canonical)
    nav-map.json         # Navigation groups
  reports/
    granthas-validation.json
    STRUCTURE.md
  docs/                  # Architecture, DG notes, changelog
  components/            # header.html, footer.html partials
  policies/              # Policy pages
  images/                # Logos, icons, illustrations
  js/                    # Reserved for future modules
  css/                   # Reserved for future stylesheets
```

## Navigation groups

See `data/nav-map.json` for Home, Library, Ācāryas, Darshanic, Seva, Kirtan/Vaarta, Other Granthas, About, Policies.
