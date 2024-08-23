const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); // Importa el objeto completo

router.get('/', equipoController.obtenerEquipos);

module.exports = router;