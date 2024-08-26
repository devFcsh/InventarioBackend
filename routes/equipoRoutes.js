const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 

router.get('/', equipoController.obtenerEquipos);
router.get('/totalEquipos', equipoController.contarEquipos);
router.delete('/eliminar/:idEquipo', equipoController.eliminarEquipo);
module.exports = router;