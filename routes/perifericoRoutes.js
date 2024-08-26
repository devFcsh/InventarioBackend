const express = require('express');
const router = express.Router();
const perifericoController = require('../controllers/perifericoController');

router.get('/', perifericoController.obtenerPerifericos);

module.exports = router;