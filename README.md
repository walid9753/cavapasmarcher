# CavaPasMarcher — état actuel

Le projet fonctionne comme un studio local gratuit : génération de sites HTML, pricing localisé, aperçu, contrôle qualité, export, versions, comptes locaux, API Node et isolation logique des projets.

## Utilisation gratuite

```bash
npm test
npm start
```

Dans un autre terminal :

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

Les données hors ligne peuvent être exportées depuis le contrôle **Sauvegarde gratuite** et importées sur un autre navigateur. Aucun compte cloud, fournisseur IA ou paiement n’est nécessaire pour utiliser le prototype local.

## Ce qui est volontairement reporté à la fin

Stripe/PayPal, fournisseurs IA externes, email, déploiement cloud, domaines personnalisés, base distante, monitoring et comptes OAuth. Ces intégrations sont facultatives et nécessitent des comptes ou des secrets qui ne doivent pas être ajoutés au dépôt.

## Vérification honnête

Le smoke test couvre l’API et l’authentification. Il faut encore exécuter `npm test` et vérifier les parcours dans un navigateur réel avant d’affirmer qu’il n’y a aucune erreur dans l’environnement cible.
