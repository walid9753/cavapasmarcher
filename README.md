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

## Vérification automatique

`npm test` exécute maintenant :

1. le smoke test API et authentification ;
2. l’audit statique des fichiers référencés dans `index.html` ;
3. la vérification de syntaxe de tous les fichiers JavaScript.

Tu peux lancer uniquement l’audit avec :

```bash
npm run audit
```

## Ce qui est volontairement reporté à la fin

Stripe/PayPal, fournisseurs IA externes, email, déploiement cloud, domaines personnalisés, base distante, monitoring et comptes OAuth. Ces intégrations sont facultatives et nécessitent des comptes ou des secrets qui ne doivent pas être ajoutés au dépôt.

## Vérification honnête

L’audit automatique ne remplace pas un test navigateur réel. Il vérifie les fichiers et la syntaxe, mais il faut encore tester les clics, le rendu responsive et les formulaires dans le navigateur cible.
