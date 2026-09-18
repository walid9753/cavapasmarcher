# CavaPasMarcher

## Run the complete local MVP

Terminal 1 — API and project persistence:

```bash
npm start
```

Terminal 2 — static dashboard (from the repository root):

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. The generator continues to work if the API is offline, and automatically persists the generated brief to `localStorage`. When the API is running, every generated project is saved in `server/data/projects.json`.

## Verify the API

```bash
npm test
```

The smoke test starts an isolated temporary API store, checks health, creation, listing, pricing and deletion, then removes the temporary data.

## Current production boundary

- `generator.js`: niche, plan, country and language-aware HTML generation.
- `countries.js`: country/currency/language catalog used by the browser.
- `api-client.js`: saves generated projects through the API with an offline fallback.
- `sites-manager.js`: lists, refreshes and deletes projects.
- `project-editor.js`: opens a saved project and pre-fills its complete brief.
- `project-actions.js`: duplicates projects and exports JSON briefs.
- `server/index.js`: validated project persistence and price calculation.
- `server/smoke-test.js`: dependency-free API smoke test.

Before public launch, add authentication, tenant isolation, a database, HTTPS, rate limiting, an exchange-rate provider, tax rules, payment webhooks, translation quality checks, generated asset storage and automated browser tests.
