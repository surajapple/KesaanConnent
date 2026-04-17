const CropRequest = require('../models/CropRequest');
const PredictionHistory = require('../models/PredictionHistory');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';


// POST /api/crop-recommend
const cropRecommend = async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;
    if ([N, P, K, temperature, humidity, ph, rainfall].some(v => v === undefined || v === ''))
      return res.status(400).json({ success: false, message: 'All 7 parameters are required' });

    const mlResponse = await axios.post(`${FASTAPI_URL}/predict/crop`, { N, P, K, temperature, humidity, ph, rainfall });
    const result = mlResponse.data.data;

    // Return result immediately — DB save is fire-and-forget
    res.json({ success: true, data: result });

    // Non-blocking DB persist
    CropRequest.create({ inputs: { N, P, K, temperature, humidity, ph, rainfall }, result }).catch(() => {});
    if (req.user) {
      PredictionHistory.create({ userId: req.user.id, type: 'crop', inputs: req.body, result }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = { cropRecommend };
