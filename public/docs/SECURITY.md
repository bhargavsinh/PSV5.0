# Security — Pushti Sahitya Vβeta 5.0

## Headers
CSP, HSTS (preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP configured via `_headers` / `netlify.toml`.

## Client
XSS-safe escaping, URL sanitization, no eval, service worker limited to same-origin static shell.

## Reporting
admin@pushtisahitya.org

## Limitations
Static public archive; no authentication system; external PDF hosts are third-party.
