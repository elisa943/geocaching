const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
  id: String,
  latitude: Number,
  longitude: Number,
  type: String,
  userId: String,
  creator: String,
  description: String,
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  }
}, { timestamps: true });

module.exports = mongoose.model('Marker', markerSchema);
