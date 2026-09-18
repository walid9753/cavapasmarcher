# CavaPasMarcher API

The API is intentionally dependency-free and now provides a safer persistence foundation for the generator.

## Run

```bash
npm start
```

The default server is `http://localhost:8787`. Set `PORT`, `CPM_DATA_FILE`, and optionally `CPM_ALLOWED_ORIGIN` in the environment.

## Endpoints

- `GET /api/health`
- `GET /api/pricing?country=FR&sector=restaurant&plan=pro`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id` — update a brief and recalculate local pricing
- `DELETE /api/projects/:id`
- `PUT /api/projects/:id/site` with `{ "html": "..." }` — persist a generated artifact
- `GET /api/projects/:id/site` — retrieve the saved artifact

## Production notes

The API validates project payloads, limits request bodies to 2 MB, adds security headers, handles CORS through `CPM_ALLOWED_ORIGIN`, applies a small in-memory rate limit, and never exposes stack traces. The JSON file is suitable for local development; use a real database and authentication before exposing this service publicly.

Run the dependency-free smoke tests with:

```bash
npm test
```
