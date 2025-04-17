const mongoose = require('mongoose');
const MONGO_URL = 'mongodb://10.188.133.109:27017/geocaching';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://10.188.133.109/geocaching');
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;