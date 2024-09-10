const express = require('express');
const router = express.Router();
const serieController = require('../controllers/serieController'); 

router.get('/', serieController.obtenerSeries);
router.get('/seriesPorModelo', serieController.seriesPorModelo);

module.exports = router;