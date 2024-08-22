const express = require('express');
const marca = require('../controllers/marcaController'); 
const router = express.Router();

router.get('/marcasPorPeriferico/:perifericoId', marca.obtenerMarcasPorPeriferico);

module.exports = router;