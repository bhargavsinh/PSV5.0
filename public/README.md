# Pushti Sahitya — V5.0

Free non-profit digital repository of Pushtimargiya Granthas.

## V5.0 highlights

1. **Production-clean source** — Perplexity/preview injections and preview storage shim removed
2. **Search** — ranking (title > author > language > description) + term highlight
3. **Service Worker** — lean precache, `granthas.json` network-first, cache `pushti-sahitya-v4.0`
4. **Digital Granthapal** — librarian + search bridge (unified with granthas.html)
5. **PWA** — manifest shortcuts, install + refresh UX
6. **Canonical data layer** — normalized accessors for mixed-case JSON fields
7. **Security** — CSP + headers; no aggressive client-side copy blocking
8. **Validation report** — `reports/granthas-validation.json`

## Local preview

```bash
python3 -m http.server 8080
```

## Content integrity

No scriptural or page text inside `.html` files was changed for this release.
