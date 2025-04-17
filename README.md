# PG219 : Projet Développement Avancé | 🌍 GeoCache

**Une application mobile de géocaching avec Node.js, MongoDB et React Native.**  

## 📌 Fonctionnalités Implémentées

### 🔐 Authentification
- **Inscription/Connexion** avec JWT (24h de validité)
- Protection des routes backend par middleware d'authentification
- Déconnexion sécurisée

### 🗺️ Géocaches
- ✅ Ajout/modification/suppression de caches (uniquement par le propriétaire)
- 📍 Affichage des caches proches (coordonnées GPS)
- ✏️ Commentaires sur les caches trouvées
- 🏷️ Filtres par difficulté/créateur

### Système de points
Chaque utilisateur peut gagner des points en fonction de la difficulté du cache récupéré ! 

| Difficulté  | Points gagnés |
|-------------|---------------|
| 1           | 5             |
| 2           | 20            |
| 3           | 30            |
| 4           | 50            |
| 5           | 100           |

### Architecture 
geocaching
├── README.md
├── client
│   ├── App.js
│   ├── app
│   ├── app.json
│   ├── assets
│   ├── components
│   ├── constants
│   ├── expo-env.d.ts
│   ├── hooks
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── scripts
│   ├── tsconfig.json
│   └── utils
└── server
    ├── Makefile
    ├── clean.js
    ├── config
    ├── controllers
    ├── middlewares
    ├── models
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── routes
    ├── server.js
    └── utils

## Commandes à effectuer pour démarrer l'application 

### Lancer le serveur :

```bash
npm install # Pour vérifier 
npm run dev # Pour le développement
npm start # Pour la production
```

### Pour lancer le client : 
```
npm install # Pour vérifier
npm run web
```

### Pour créer le client : 
```
npx create-expo-app@latest
```

## Organisation en arbre
```
geocaching/
├── README.md
├── client
│   ├── Makefile
│   ├── README.md
│   ├── app
│   ├── app.json
│   ├── assets
│   ├── components
│   ├── constants
│   ├── expo-env.d.ts
│   ├── hooks
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── scripts
│   └── tsconfig.json
└── server
    ├── Makefile
    ├── app.js
    ├── config
    ├── controllers
    ├── middlewares
    ├── models
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── routes
    ├── server.js
    └── utils
```



