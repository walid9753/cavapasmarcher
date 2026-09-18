# CavaPasMarcher

## État actuel

Le dépôt contient un studio frontend de génération de sites et une API Node.js sans dépendance externe. Le flux actuel permet de créer un brief, calculer un prix localisé, générer une prévisualisation, sauvegarder le projet, le rouvrir, le dupliquer et exporter son brief.

La dernière étape ajoute la persistance de l’artefact HTML généré : après une génération réussie, le brief est créé ou mis à jour et le HTML de la prévisualisation est enregistré dans le même projet. Cela évite de perdre le site quand on recharge le dashboard.

## Lancer localement

Terminal 1 — API :

```bash
npm start
```

Terminal 2 — dashboard statique :

```bash
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`.

## Vérifier

```bash
npm test
```

Le smoke test utilise un fichier temporaire et couvre la santé de l’API, la création, la mise à jour, la tarification, la sauvegarde/récupération de l’artefact et la suppression.

## Limites importantes avant production

Cette base n’est pas encore un SaaS public : il manque l’authentification, l’isolation entre comptes, une vraie base de données, HTTPS, un fournisseur de paiement, les webhooks, les règles fiscales et la validation de contenu généré. Le fichier JSON est uniquement adapté au développement local ou à une démonstration contrôlée.
