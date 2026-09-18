# CavaPasMarcher — état du projet

La base comprend maintenant le dashboard, le moteur de génération premium par niche, le pricing localisé, la prévisualisation, la sauvegarde des HTML, les versions, l’export, un contrôle qualité, une API Node et des comptes avec isolation logique des projets.

## Lancer

```bash
npm start
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`.

## Compte de développement

Le panneau **Compte agence** apparaît en bas à droite. Créez un compte avec un mot de passe d’au moins 10 caractères, puis connectez-vous. Le token de session est conservé localement pour reconnecter le dashboard à l’API.

```bash
npm test
```

## Limites honnêtes avant production publique

Le projet est fonctionnel pour un MVP avancé, mais avant de le vendre publiquement il faut encore migrer les comptes/projets vers PostgreSQL, remplacer les sessions mémoire par des cookies HttpOnly ou un fournisseur d’identité, ajouter récupération de compte, Stripe/PayPal, stockage d’assets, déploiement, domaines, emails, monitoring, sauvegardes, conformité RGPD et tests navigateur.
