const mongoose = require('mongoose');

const PredictionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['crop', 'disease', 'yield', 'price', 'weather', 'pest'] },
  inputs: mongoose.Schema.Types.Mixed,
  result: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PredictionHistory', PredictionHistorySchema);
