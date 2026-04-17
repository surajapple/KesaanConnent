const express = require('express');
const router = express.Router();
const { cropRecommend } = require('../controllers/cropController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, cropRecommend);

module.exports = router;
