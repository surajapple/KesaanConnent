const mongoose = require('mongoose');

const CropRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inputs: {
    N: Number, P: Number, K: Number,
    temperature: Number, humidity: Number,
    ph: Number, rainfall: Number,
  },
  result: {
    crop: String,
    confidence: Number,
    alternatives: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CropRequest', CropRequestSchema);
