const express = require('express');
const router = express.Router();
const serieController = require('../controllers/serieController'); // Importa el objeto completo

router.get('/seriesPorModelo', serieController.seriesPorModelo);

module.exports = router;