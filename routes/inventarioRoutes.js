const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController'); // Importa el objeto completo

router.get('/inventariosPorSerie', inventarioController.inventarioPorSerie);

module.exports = router;