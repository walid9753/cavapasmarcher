# CavaPasMarcher API

API locale sans dépendance pour les projets et leurs sites générés.

## Endpoints

- `GET /api/health`
- `GET /api/pricing?country=FR&sector=restaurant&plan=pro`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `PUT /api/projects/:id/site` avec `{ "html": "..." }`
- `GET /api/projects/:id/site`

Le frontend réutilise l’identifiant du dernier projet : une nouvelle génération met donc à jour le projet existant au lieu de créer systématiquement des doublons. L’artefact HTML affiché dans l’iframe de prévisualisation est sauvegardé après le brief.

## Sécurité actuelle

Les payloads sont validés, limités à 2 Mo, les réponses ont des en-têtes de sécurité, CORS peut être limité par `CPM_ALLOWED_ORIGIN`, une limitation mémoire simple est active et les détails de stack ne sont jamais exposés par défaut.

Avant une mise en ligne : remplacer le fichier JSON par PostgreSQL, ajouter authentification/autorisation et utiliser un stockage d’artefacts dédié.
