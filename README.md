# CavaPasMarcher — AI Web Agency MVP

Prototype frontend for an automated web agency: prospect discovery, lead scoring, quote generation, and a custom site preview.

## Run locally

No build step is required. Open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080.

## Included

- Dashboard with revenue and pipeline metrics
- Prospect list with automatic 0–100 opportunity scoring
- Prospect detail view with audit signals
- Quote generator with three packages
- Site brief generator and live website preview
- French UI and local demo data

This is a frontend MVP. Production integrations (real business data providers, authentication, AI API, payments, CRM, and deployment) should be added behind a backend API. Never expose provider API keys in browser code.
