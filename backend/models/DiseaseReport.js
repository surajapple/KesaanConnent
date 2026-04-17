const mongoose = require('mongoose');

const DiseaseReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: String,
  result: {
    disease: String,
    confidence: Number,
    severity: String,
    treatment: [String],
    prevention: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DiseaseReport', DiseaseReportSchema);
