const PredictionHistory = require('../models/PredictionHistory');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// POST /api/yield-predict
const predictYield = async (req, res) => {
  try {
    const { crop, area, soilType, rainfall, temperature, fertilizer } = req.body;
    if (!crop || !area) return res.status(400).json({ success: false, message: 'Crop and area are required' });

    // Call FastAPI ML Microservice
    const mlResponse = await axios.post(`${FASTAPI_URL}/predict/yield`, req.body);
    const result = mlResponse.data.data;

    // Return result immediately
    res.json({ success: true, data: result });

    // Non-blocking DB persist
    if (req.user) {
      PredictionHistory.create({ userId: req.user.id, type: 'yield', inputs: req.body, result }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { predictYield };
