const express = require('express');
const router = express.Router();
const { priceForecast, priceForecastAll, getStates, getMandis } = require('../controllers/priceController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, priceForecast);
router.get('/all', optionalAuth, priceForecastAll);
router.get('/states', getStates);
router.get('/mandis', getMandis);

module.exports = router;
