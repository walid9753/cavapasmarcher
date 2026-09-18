# Security policy

## Supported versions

The `main` branch is the only actively maintained version.

## Reporting a vulnerability

Do not publish credentials, tokens, personal data, or exploit details in a public issue. Send a private report to the repository owner through GitHub security advisories or the repository owner's private contact channel.

Include:

- affected endpoint or file;
- reproducible steps;
- impact;
- suggested mitigation, if known.

Until the report is reviewed, do not expose `CPM_AUTH_TOKEN`, session tokens, `users.json`, or `projects.json`.

## Deployment requirements

Before public deployment:

- use HTTPS;
- set a specific `CPM_ALLOWED_ORIGIN` instead of `*`;
- use a long random secret only through environment variables;
- do not serve `server/data` publicly;
- migrate JSON persistence to a durable database;
- use HttpOnly, Secure, SameSite cookies or a managed identity provider;
- configure backups, monitoring, rate limiting at the reverse proxy, and log redaction.
