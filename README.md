# CavaPasMarcher — état actuel

## Déjà présent

- studio frontend sans framework ;
- génération HTML premium par niche, pays, langue et forfait ;
- pricing localisé ;
- prévisualisation responsive ;
- export HTML et export JSON du brief ;
- contrôle qualité minimal ;
- versions locales et serveur ;
- API Node.js sans dépendances ;
- comptes locaux avec mot de passe haché ;
- sessions temporaires et isolation logique des projets ;
- sauvegarde/restauration locale gratuite ;
- galerie, recherche, ouverture et suppression de projets ;
- audit statique des assets et de la syntaxe JavaScript.

## Utilisation sans dépense

```bash
git pull
npm test
npm start
```

Dans un second terminal :

```bash
python3 -m http.server 8080
```

Puis ouvre `http://localhost:8080`.

## Reste à tester

Le code n’est pas déclaré sans bug avant exécution locale. Le contrôle navigateur doit couvrir inscription, connexion, génération, sauvegarde, galerie, recherche, ouverture, suppression, export et restauration.

## Reporté à la fin

Les services externes restent facultatifs : paiements, fournisseur IA, email, OAuth, base distante, stockage cloud, domaines, déploiement, monitoring et backups serveur.
