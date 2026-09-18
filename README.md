# CavaPasMarcher — état réel

Le projet comprend maintenant : génération premium par niche, pays, langues et forfaits ; pricing localisé ; prévisualisation ; sauvegarde HTML ; versions locales et serveur ; export HTML ; contrôle qualité ; API Node ; comptes avec inscription/connexion ; sessions bearer ; isolation logique des projets par utilisateur ; mode administrateur legacy ; tests API.

## Lancer

```bash
npm start
python3 -m http.server 8080
```

## Tester

```bash
npm test
```

## Auth

Créer un compte avec `POST /api/auth/register`, se connecter avec `POST /api/auth/login`, puis envoyer `Authorization: Bearer <token>` sur les routes privées. `CPM_AUTH_TOKEN` reste un mode admin legacy pour usage interne.

## Avant commercialisation

Le cœur fonctionnel est avancé mais ce n’est pas encore un produit commercial totalement prêt : migration PostgreSQL/Redis, cookies HttpOnly, récupération de compte, dashboard de connexion, paiements Stripe/PayPal, webhooks, stockage d’assets, déploiement automatique, domaines, emails, monitoring, backups, RGPD, fiscalité et tests navigateur restent indispensables.
