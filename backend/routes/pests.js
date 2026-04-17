const express = require('express');
const router = express.Router();
const { getPests } = require('../controllers/pestController');

router.get('/', getPests);

module.exports = router;
