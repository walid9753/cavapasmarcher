# CavaPasMarcher API — authentification

## Comptes

- `POST /api/auth/register` avec `{ name, email, password }` (mot de passe de 10 caractères minimum).
- `POST /api/auth/login` avec `{ email, password }` retourne un bearer token de session valable 7 jours en mémoire.
- `GET /api/auth/me` retourne l’utilisateur connecté.
- `POST /api/auth/logout` invalide la session.

Les projets créés par un compte possèdent un `ownerId` interne et ne sont visibles que par ce compte. Le rôle `admin` peut voir tous les projets. Le mode `CPM_AUTH_TOKEN` historique reste disponible pour le développement interne et agit comme administrateur legacy.

## Limite actuelle

Les sessions sont en mémoire et les comptes sont stockés dans un fichier JSON : cette étape fournit une vraie séparation logique pour le prototype, mais il faut migrer vers PostgreSQL/Redis, des cookies HttpOnly ou un fournisseur d’identité avant une exposition publique.
