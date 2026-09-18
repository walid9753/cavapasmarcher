# Production foundation

This folder contains the first backend boundary for the studio. It is intentionally dependency-free so it can run on Node 20 without exposing API keys in the browser.

## Run

```bash
npm start
```

The API listens on `http://localhost:8787`.

## Endpoints

- `GET /api/health`
- `GET /api/countries`
- `GET /api/pricing?country=FR&sector=restaurant&plan=pro`
- `GET /api/projects`
- `POST /api/projects` with a JSON project payload
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`

## Important

The current store is a local JSON file for development. Before production, replace it with PostgreSQL/Supabase, add authentication and tenant isolation, validate payment/tax rules per country, and put the API behind HTTPS and a rate limiter.
