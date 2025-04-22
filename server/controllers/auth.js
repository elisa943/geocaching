const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.register = async (req, res) => { 
  const { email, password, pseudo } = req.body;

  try {
    // Validation simple
    if (!email || !password || !pseudo) {
      return res.status(400).json({ 
        success: false,
        error: "Email, mot de passe et pseudo requis" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }

    // Vérifier que l'email n'est pas déjà pris
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Cet email est déjà utilisé"
      });
    }

    // Vérifier que le pseudo n'est pas déjà pris
    const existingPseudo = await User.findOne({ pseudo });
    if (existingPseudo) {
      return res.status(400).json({
        success: false,
        error: "Ce pseudo est déjà pris"
      });
    }

    // vérifier que l'email est valide
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Email invalide"
      });
    }

    // Créer le nouvel utilisateur avec pseudo, email et mot de passe
    const user = await User.create({ email, password, pseudo, points: 0, caches_created: 0, caches_found: 0, mean_difficulty: 0 });

    // Envoyer le token après l'enregistrement
    sendToken(user, 201, res);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Erreur - Veuillez réessayer"
    });
  }
};

// @desc    Connexion utilisateur
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Email et mot de passe requis', 400));
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Helper pour envoyer le token
const sendToken = (user, statusCode, res) => {
  const token = user.generateToken();
  res.status(statusCode).json({ 
    success: true, 
    token, 
    pseudo: user.pseudo // On inclut le pseudo dans la réponse
  });
};

// @desc    Récupérer les infos de l'utilisateur connecté
exports.getMe = async (req, res) => {
  try {
    // Ne renvoyez que les données nécessaires
    const user = await User.findById(req.user.id).select('pseudo email points caches_created caches_found mean_difficulty');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};