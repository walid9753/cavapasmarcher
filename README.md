# CavaPasMarcher — état réel du projet

## Fonctionnalités présentes

- dashboard frontend sans framework ;
- génération HTML premium par niche, pays, langue et forfait ;
- pricing Basic / Pro / Ultimate ;
- prévisualisation responsive ;
- sauvegarde de projets et d’artefacts HTML ;
- versions locales et serveur ;
- restauration locale ;
- export HTML ;
- contrôle qualité minimal ;
- API Node.js sans dépendance ;
- inscription, connexion, déconnexion et `/api/auth/me` ;
- mots de passe hachés avec `scrypt` ;
- sessions temporaires avec expiration ;
- isolation logique des projets par utilisateur ;
- smoke test API incluant invalidation de session.

## Lancer

```bash
npm start
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`.

## Vérifier

```bash
npm test
```

## Configuration

- `CPM_DATA_FILE` : fichier de projets local.
- `CPM_USERS_FILE` : fichier de comptes local.
- `CPM_ALLOWED_ORIGIN` : origine autorisée par le navigateur.
- `CPM_AUTH_TOKEN` : token admin legacy optionnel.

## Statut honnête

Le cœur MVP est fonctionnel, mais une mise en production commerciale exige encore une base durable, des cookies HttpOnly ou un fournisseur d’identité, récupération de compte, paiements, webhooks, stockage d’assets, déploiement, domaines, emails, monitoring, sauvegardes, RGPD et tests navigateur. Aucun projet ne devrait être déclaré sans erreur avant l’exécution réelle de `npm test` et de tests navigateur sur l’environnement cible.
