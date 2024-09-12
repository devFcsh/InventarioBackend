const express = require('express');
const router = express.Router();
const dominioController = require('../controllers/dominioController');

router.get('/', dominioController.obtenerDominios);

module.exports = router;