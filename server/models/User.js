const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe requis'],
    minlength: 6,
    select: false // Ne pas retourner le mot de passe dans les requêtes
  },
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  }, 
  points: {
    type: Number,
    default: 0
  }, 
  caches_created: {
    type: Number,
    default: 0
  },
  caches_found: {
    type: Number,
    default: 0
  }, 
  mean_difficulty: {
    type: Number,
    default: 0
  },
});

// Hash du mot de passe avant sauvegarde
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Génération du token JWT (valable 24h)
UserSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Vérification du mot de passe
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);