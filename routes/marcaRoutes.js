const express = require('express');
const marcaController = require('../controllers/marcaController'); 
const router = express.Router();

router.get('/', marcaController.obtenerMarcas);
router.get('/marcasPorPeriferico/:perifericoId', marcaController.obtenerMarcasPorPeriferico);

module.exports = router;