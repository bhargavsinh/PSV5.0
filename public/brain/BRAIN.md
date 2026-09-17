# Pushti Sahitya — Website Brain

## 1. Purpose
This directory is the local **Website Brain** for the project. It is an indexed, traceable representation of information already present inside the website project. It is **not an AI knowledge base** and does not provide outside knowledge.

## 2. Absolute Knowledge Boundary
The Brain may use only local project sources. During generation, it must not use Internet search, external AI, external APIs, scraping, or general outside knowledge to fill gaps. If information is absent from the project, it remains unknown rather than being guessed.

**Website-local source → Brain index. Never external knowledge → Brain.**

## 3. Project Identity
- Site version recorded in project navigation: `Vβeta 5.0`
- Architecture: Static multi-page PWA.
- Shared chrome is documented by the local architecture document as `header.html` / `footer.html` injected by `script.js`.
- Canonical Grantha data: `public/data/granthas.json`.
- Navigation map: `public/data/nav-map.json`.
- PWA assets: `public/manifest.webmanifest`, `public/sw.js`.
- Project documentation: `public/docs/`.

## 4. Indexed Project Scope
- HTML files indexed: **98**
- Grantha records indexed: **328**
- Link records analyzed: **946**
- Internal links: **560**
- External URL references found in HTML: **370**
- Local internal links with missing targets: **94**

## 5. Brain Files
| File | Purpose |
|---|---|
| `BRAIN.md` | Human-readable master description and rules |
| `site-map.json` | Indexed local HTML pages and project navigation |
| `grantha-index.json` | Snapshot/index derived from canonical `public/data/granthas.json` |
| `content-index.json` | Titles, descriptions, headings, scripts and styles discovered in HTML |
| `link-index.json` | Internal, external, anchor and other link analysis |
| `feature-index.json` | Features detected from the actual project |
| `data-sources.json` | Traceable source inventory and external-reference boundary |
| `rules.json` | Governing rules for the Website Brain |
| `brain-version.json` | Brain version, generation time and source scope |

## 6. Canonical Data
`public/data/granthas.json` remains the authoritative Grantha dataset. `grantha-index.json` is an indexed snapshot and must never override the canonical file. If the canonical file changes, regenerate the Brain.

`public/data/nav-map.json` is the project's existing navigation map and is indexed by `site-map.json`.

## 7. Digital Granthapal
The project contains `public/digital-granthapal-v62.js`. Its local code documents an add-only real-time search bridge that sends the query to `granthas.html?q=...` and uses the existing Grantha search engine. The Brain records this implementation; it does not replace it with an external search or AI system.

## 8. External References vs External Knowledge
The website's data may contain remote Ebook URLs. These are existing website references, not Brain knowledge sources. The Brain generator does not fetch them. Their presence is recorded in `data-sources.json` with `knowledge_source: false`.

## 9. Content Preservation
The Brain does not rewrite source HTML, Grantha titles, descriptions, policy text, Sanskrit/Gujarati/Hindi text, navigation labels, or other website content. It reads and indexes the existing project.

## 10. Design Preservation
Adding the Brain does not require a redesign. Existing CSS, Pop-Art/UI styling, layout, responsive behavior, PWA behavior and navigation remain outside the Brain's responsibility.

## 11. Traceability
Core source files are recorded with SHA-256 hashes where practical. Brain records identify their local source scope. This makes the index auditable and helps detect stale data.

## 12. Regeneration Rule
The Brain should be regenerated from the current project whenever canonical data or site structure changes. A future generator should scan local files only and reproduce the same source-boundary rules in `rules.json`.

## 13. Verification
This Brain was generated from the extracted project contents. JSON files should be parsed before deployment. The project should be re-audited after any future change to canonical data or site structure.

## 14. Non-Negotiable Rules
1. Website data is the only knowledge source.
2. No Internet knowledge may be added.
3. No AI-generated facts may be inserted.
4. No guessing missing information.
5. No conflicting canonical Grantha database.
6. Do not modify original website text merely to create the Brain.
7. Do not redesign the website merely to create the Brain.
8. The Brain is an index/documentation layer, not an AI service.
