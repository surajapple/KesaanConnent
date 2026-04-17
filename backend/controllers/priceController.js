const PredictionHistory = require('../models/PredictionHistory');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// GET /api/price-forecast?crop=wheat
const priceForecast = async (req, res) => {
  try {
    const { crop } = req.query;
    if (!crop) return res.status(400).json({ success: false, message: 'crop query parameter is required' });

    // Call FastAPI ML Microservice
    const mlResponse = await axios.get(`${FASTAPI_URL}/predict/price?crop=${crop}`);
    const data = mlResponse.data.data;

    // Return result immediately
    res.json({ success: true, data });

    // Non-blocking DB persist
    if (req.user) {
      PredictionHistory.create({ userId: req.user.id, type: 'price', inputs: { crop }, result: data }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/price-forecast/all?state=Maharashtra
const priceForecastAll = async (req, res) => {
  try {
    const { state } = req.query;
    const url = state
      ? `${FASTAPI_URL}/predict/prices/all?state=${encodeURIComponent(state)}`
      : `${FASTAPI_URL}/predict/prices/all`;
    const mlResponse = await axios.get(url);
    res.json({ success: true, data: mlResponse.data.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/price-forecast/states
const getStates = async (req, res) => {
  try {
    const mlResponse = await axios.get(`${FASTAPI_URL}/predict/states`);
    res.json({ success: true, data: mlResponse.data.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/price-forecast/mandis?state=Maharashtra
const getMandis = async (req, res) => {
  try {
    const { state } = req.query;
    const mlResponse = await axios.get(`${FASTAPI_URL}/predict/mandis?state=${encodeURIComponent(state)}`);
    res.json({ success: true, data: mlResponse.data.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { priceForecast, priceForecastAll, getStates, getMandis };
