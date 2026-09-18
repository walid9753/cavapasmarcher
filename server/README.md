# CavaPasMarcher API

## Version API

- `GET /api/projects/:id/versions` — liste les versions sans exposer le HTML lourd.
- `POST /api/projects/:id/versions` avec `{ html, name, project }` — crée une version, ignore un doublon consécutif et conserve au maximum 30 versions.
- `GET /api/projects/:id/versions/:versionId` — récupère une version complète avec son HTML.

Le dashboard enregistre le brief, l’artefact actif et une version serveur après chaque génération. L’historique local reste disponible hors ligne.

Avant une mise en production, remplacer le JSON par PostgreSQL ou un stockage durable, ajouter l’authentification et associer chaque projet à un compte utilisateur.
