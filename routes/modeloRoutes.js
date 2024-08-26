const express = require('express');
const router = express.Router();
const modeloController = require('../controllers/modeloController'); 

router.get('/modelosPorMarcaPeriferico', modeloController.modelosPorMarcaPeriferico);

module.exports = router;