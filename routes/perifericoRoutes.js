const express = require('express');
const router = express.Router();
const perifericoController = require('../controllers/perifericoController'); // Importa el objeto completo

router.get('/', perifericoController.obtenerPerifericos);

module.exports = router;