require('dotenv').config();
console.log('JWT_SECRET chargé ?', process.env.JWT_SECRET ? 'OUI' : 'NON'); // Debug
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const markerRoutes = require('./routes/markers');

// Initialisation
const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://10.188.133.109:19006', // Web
    'http://10.188.133.109:8081', // Tunnel Expo (mobile/émulateur)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ajoutez OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/markers', markerRoutes);

// Routes non trouvées
const errorHandler = require('./middlewares/error');
app.use(errorHandler);

// Gestion des erreurs non catchées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err);
  process.exit(1);
});

// Connexion DB + Lancement serveur
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      
      // Vérification de l'accessibilité du port
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Le port ${PORT} est déjà utilisé. Essayez avec le port ${Number(PORT)+1}`);
          process.exit(1);
        }
      });
    });

    // Arrêt propre
    process.on('SIGINT', () => {
      server.close(() => {
        console.log('\nServeur arrêté proprement');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Erreur au démarrage:', err);
    process.exit(1);
  }
};

startServer();