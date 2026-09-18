# CavaPasMarcher — état du projet

Le studio dispose maintenant d’un flux complet de génération locale : brief métier, pays/langue, forfait, pricing localisé, résolution de niche, rendu HTML premium, prévisualisation, sauvegarde API et export HTML.

## Utilisation

```bash
npm start
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`, cliquer sur **Nouveau site**, remplir le brief puis générer. Après génération, les actions permettent de télécharger le HTML autonome ou de l’ouvrir dans un nouvel onglet.

## Architecture active

- `data/plans.js` : Basic, Pro et Ultimate.
- `data/niches.js` : univers métier et résolution automatique.
- `services/pricing.js` : pricing localisé côté navigateur.
- `services/site-builder.js` : constructeur HTML premium.
- `premium-generator.js` : branchement du constructeur à l’interface.
- `api-client.js` : persistance du brief et de l’artefact HTML.
- `site-export.js` : export et ouverture du site produit.
- `server/index.js` : API locale de projets et artefacts.

## Vérification

```bash
npm test
```

Le test couvre la création, la modification, le pricing, la sauvegarde/récupération d’un artefact et la suppression d’un projet.

## Limites avant lancement commercial

Le projet est une fondation fonctionnelle, pas encore un SaaS public : authentification, isolation multi-tenant, PostgreSQL, stockage d’assets, paiement, webhooks, traduction IA, déploiement et monitoring restent à intégrer avant toute exposition publique.
