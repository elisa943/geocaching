# PG219 : Projet Développement Avancé | 🌍 GeoCache

**Une application mobile de géocaching avec Node.js, MongoDB et React Native.**  
L'objectif de ce projet est de proposer une application permettant aux utilisateurs de créer, chercher et découvrir des géocaches. 

## 📌 Fonctionnalités Implémentées

### 🔐 Authentification
- Inscription, connexion, et déconnexion sécurisée avec les jetons JWT (24h de validité)
- Hachage des mots de passe
- Protection des routes backend par middleware d'authentification
- Récupération automatique des infos utilisateur à partir du token

### 🗺️ Géocaches
- Les attributs des caches sont : `id`, `latitude`, `longitude`, `creator`, `description`, `difficulty`
- Ajout et modification de caches par le propriétaire 
- Suppression automatique du cache lorsqu’il est découvert par un autre utilisateur

### 📍 Marqueurs & Cartographie
- Affichage, ajout, modification et suprression des caches directement sur la carte dynamique dans l'application React Native via WebView (Leaflet.js)
- Chargement des marqueurs depuis une base de données MongoDB
- Filtrage des caches affichés selon leur niveau de difficulté

## Système de points
Chaque utilisateur peut gagner des points en fonction de la difficulté du cache récupéré ! 

| Difficulté  | Points gagnés |
|-------------|---------------|
| 1           | 5             |
| 2           | 20            |
| 3           | 30            |
| 4           | 50            |
| 5           | 100           |

## Organisation et Architecture 

### Organisation du projet 
```
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
```

### ⚙️ Stack Technique

| Côté client (mobile) | Côté serveur (API REST) |
|----------------------|--------------------------|
| React Native (Expo)  | Node.js + Express        |
| Leaflet (via WebView) | MongoDB (via Mongoose)  |
| JWT, Axios           | Bcrypt, CORS             |


## Commandes à effectuer pour démarrer l'application 

### Lancer le serveur :

```bash
npm install # pour installer les paquets
npm start 
```

### Pour lancer le client : 
```
npm install
npm run web
```

### Pour créer le client : 
```
npx create-expo-app@latest
```
