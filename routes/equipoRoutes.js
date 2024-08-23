const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); // Importa el objeto completo

router.get('/', equipoController.obtenerEquipos);
router.delete('/eliminar/:idEquipo', equipoController.eliminarEquipo);
module.exports = router;