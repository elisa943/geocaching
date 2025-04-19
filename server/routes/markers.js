const express = require('express');
const mongoose = require('mongoose');
const Marker = require('../models/Marker');
const User = require('../models/User');

const router = express.Router();

// GET all markers
router.get('/', async (req, res) => {
    const markers = await Marker.find();
    res.json(markers);
});

// POST new marker
router.post('/', async (req, res) => {
    try {
      const { latitude, longitude, difficulty, description, creator } = req.body;
  
      const newMarker = new Marker({ latitude, longitude, difficulty, description, creator });
      await newMarker.save();
  
      // Incrémentation du compteur dans User
      await User.findOneAndUpdate(
        { pseudo: creator },
        { $inc: { caches_created: 1 } }
      );
  
      res.status(201).json(newMarker);
    } catch (error) {
      console.error('Erreur lors de l’ajout du marqueur :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET marker by ID
router.put('/:id', async (req, res) => {
    try {
        console.log('Updating marker with id:', req.params.id);
        
        const updated = await Marker.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    difficulty: req.body.difficulty,
                    description: req.body.description
                }
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Marker not found' });
        }

        res.json(updated); // Retourne le document mis à jour

    } catch (error) {
        console.error('Erreur de mise à jour:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE marker
router.delete('/:id', async (req, res) => {
    const marker = await Marker.findByIdAndDelete(req.params.id);
    
    if (!marker) {
        return res.status(404).json({ message: 'Marker not found' });
    }

    res.status(204).end();
});

//! A VERIFIER
// DELETE when a cache is found → update user stats, then remove marker
router.delete('/found/:id', async (req, res) => {
    try {
      // 1. Récupérer le marqueur
      const marker = await Marker.findById(req.params.id);
      if (!marker) {
        return res.status(404).json({ message: 'Marker not found' });
      }
      
      const { difficulty } = marker;

      // on récupère le pseudo de celui qui trouve
      const { finderPseudo } = req.body;
      if (!finderPseudo) {
        return res.status(400).json({ message: 'Il faut indiquer finderPseudo dans le body' });
      }
  
      // 2. Déterminer les points à ajouter
      const pointsTable = {
        1: 5,
        2: 20,
        3: 30,
        4: 50,
        5: 100
      };
      const pointsEarned = pointsTable[difficulty] || 0;
  
      // 3. Mettre à jour l'utilisateur
      const user = await User.findOne({ pseudo: finderPseudo });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Calcul de la nouvelle moyenne de difficulté
      const oldCount = user.caches_found;
      const oldMean  = user.mean_difficulty;
      const newCount = oldCount + 1;
      const newMean  = oldCount === 0
        ? difficulty
        : ((oldMean * oldCount) + difficulty) / newCount;
  
      user.caches_found     = newCount;
      user.points          += pointsEarned;
      user.mean_difficulty  = newMean;
      await user.save();
  
      // 4. Supprimer le marqueur
      await Marker.findByIdAndDelete(req.params.id);
  
      // 5. Retourner la mise à jour
      res.json({
        message: 'Cache marqué comme trouvé et stats mises à jour',
        user: {
          pseudo: user.pseudo,
          points: user.points,
          caches_found: user.caches_found,
          mean_difficulty: user.mean_difficulty.toFixed(2)
        }
      });
    } catch (error) {
      console.error('Erreur lors du traitement d’un cache trouvé :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  

module.exports = router;
