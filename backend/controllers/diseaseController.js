const DiseaseReport = require('../models/DiseaseReport');
const PredictionHistory = require('../models/PredictionHistory');
const path = require('path');

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';


// POST /api/disease-detect
const detectDisease = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required' });

    const filename = req.file.originalname || 'image.jpg';
    
    // Create form data to forward to FastAPI
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path), filename);
    
    // Call FastAPI ML Microservice
    const mlResponse = await axios.post(`${FASTAPI_URL}/predict/disease`, formData, {
        headers: { ...formData.getHeaders() }
    });
    
    const result = mlResponse.data.data;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Return immediately
    res.json({ success: true, data: result, imageUrl });

    // Non-blocking DB persist
    DiseaseReport.create({ imageUrl, result }).catch(() => {});
    if (req.user) {
      PredictionHistory.create({ userId: req.user.id, type: 'disease', inputs: { imageUrl }, result }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { detectDisease };
