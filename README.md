# CavaPasMarcher — état réel

## Ce qui fonctionne

- dashboard frontend sans framework ;
- génération HTML premium localisée par pays, langue, forfait et niche ;
- pricing Basic / Pro / Ultimate ;
- prévisualisation responsive ;
- sauvegarde de projets et d’artefacts HTML ;
- historique de versions local et serveur ;
- restauration locale ;
- export HTML ;
- contrôle qualité minimal avant livraison ;
- API Node.js sans dépendance ;
- authentification Bearer optionnelle par `CPM_AUTH_TOKEN` ;
- smoke test API.

## Authentification locale

Sans `CPM_AUTH_TOKEN`, l’API fonctionne en développement local. Pour activer la protection :

```bash
CPM_AUTH_TOKEN="un-secret-long-et-aleatoire" npm start
```

Le dashboard peut envoyer le token avec :

```html
<script>window.CPM_API_TOKEN = 'un-secret-long-et-aleatoire';</script>
```

Ne committez jamais ce token. En production, utilisez un vrai système de comptes, des sessions sécurisées et une base de données multi-tenant.

## Vérification

```bash
npm test
```

## Ce qui manque encore avant de dire « produit commercial complet »

Cette version est une fondation fonctionnelle, pas un SaaS commercial fini. Il manque encore : PostgreSQL ou autre base durable, authentification utilisateur complète avec inscription/réinitialisation, isolation multi-tenant, stockage d’assets, paiements Stripe/PayPal et webhooks, traduction IA contrôlée, génération d’images sous licence, déploiement automatique, domaines, sauvegardes, logs, monitoring, conformité RGPD, règles fiscales, emails transactionnels et tests navigateur automatisés.
