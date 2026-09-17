# Digital Granthapal — Vβeta 6.2 (site Vβeta 5.0)

## Real-Time Grantha Search Bridge

ADD-ONLY search bridge to the existing Grantha search engine.

### Flow

Digital Granthapal search input → `granthas.html?q=<query>` → existing `script.js` search → `granthas.json` filtering → existing result cards.

Does not maintain a second database and does not invent results.

### Same-page live mode

On `granthas.html`, typing in the Granthapal search box mirrors into `#search-input`.

### Cross-page mode

From other pages, navigates to `granthas.html?q=...` via `URLSearchParams`.

### Site version

This module ships with **Pushti Sahitya Vβeta 5.0**.
