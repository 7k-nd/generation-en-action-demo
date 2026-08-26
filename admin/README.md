# Administration — démo

Mot de passe : `gea-koekelberg-2026` (défini dans `/js/admin-config.js`).

## Ce que fait cette démo

- Le **blog public** lit les articles de `/data/articles.json`, fusionnés avec les créations / modifications / suppressions enregistrées dans le `localStorage` du navigateur (`gea_articles`).
- Les **messages** du formulaire contact sont stockés dans `gea_messages` (même navigateur) **et** ouvrent un e-mail vers `team.generationbrussels@gmail.com`.
- Sur GitHub Pages, il n'y a pas de serveur : chaque visiteur voit les articles de départ ; seuls les changements faits **dans son navigateur** restent.

## Ce que ce n'est pas

Le mot de passe côté client **n'est pas une vraie sécurité**. N'y mettez aucune donnée sensible. En production : un vrai backend, des comptes nominatifs, HTTPS, pas de secret dans le JavaScript.

Ne commitez pas d'autres secrets que ce mot de passe de démonstration.

## API optionnelle (Node)

Si vous hébergez plus tard un petit serveur :

```
npm install
npm run api
```

Écoute le port **3847**, fichiers dans `data/db.json`. Le site tente `/api` d'abord, puis retombe sur le `localStorage`.
