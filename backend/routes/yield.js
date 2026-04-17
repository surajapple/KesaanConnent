const express = require('express');
const router = express.Router();
const { predictYield } = require('../controllers/yieldController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, predictYield);

module.exports = router;
